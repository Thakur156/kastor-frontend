import { useEffect, useState } from 'react';
import { Save, Settings, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { getConfigFields, getConfig, saveConfig } from '~/services/rest-services/config-api';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { toast } from '~/components/ui/use-toast';

interface ConfigField {
  alias: string;
  required: boolean;
  type: string;
  default: string | number | boolean | null;
  allowed_values: string[] | null;
}

interface ConfigFields {
  [key: string]: ConfigField;
}

type FormValue = string | number | boolean | null;

interface FormValues {
  [key: string]: FormValue;
}

interface ValidationErrors {
  [key: string]: string;
}

function ConfigPage() {
  const [configFields, setConfigFields] = useState<ConfigFields>({});
  const [formValues, setFormValues] = useState<FormValues>({});
  const [originalValues, setOriginalValues] = useState<FormValues>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        setLoading(true);
        
        // Fetch field definitions first
        const fieldsData = await getConfigFields();
        console.log('Config fields received from API:', fieldsData);
        
        // Try to fetch current config values
        let currentConfig = {};
        try {
          currentConfig = await getConfig();
          console.log('Current config received from API:', currentConfig);
        } catch (configErr) {
          console.warn('Failed to fetch current config, using defaults:', configErr);
          toast({
            description: 'Could not load current values, showing defaults',
            variant: 'default',
            title: 'Warning'
          });
        }
        
        setConfigFields(fieldsData);
        
        // Initialize form values with current config values, fallback to defaults
        const initialValues: FormValues = {};
        
        // Create a case-insensitive mapping for config keys
        const configLowerMap: {[key: string]: string} = {};
        Object.keys(currentConfig).forEach(key => {
          configLowerMap[key.toLowerCase()] = key;
        });
        
        Object.entries(fieldsData).forEach(([fieldKey, field]) => {
          const configField = field as ConfigField;
          
          // Try to find matching config value using multiple strategies:
          let configValue = undefined;
          
          // Strategy 1: Exact match
          if (currentConfig[fieldKey] !== undefined) {
            configValue = currentConfig[fieldKey];
            console.log(`Strategy 1 (exact) - ${fieldKey}: found="${configValue}"`);
          } 
          // Strategy 2: Case-insensitive match
          else {
            const lowerFieldKey = fieldKey.toLowerCase();
            const matchingConfigKey = configLowerMap[lowerFieldKey];
            if (matchingConfigKey && currentConfig[matchingConfigKey] !== undefined) {
              configValue = currentConfig[matchingConfigKey];
              console.log(`Strategy 2 (case-insensitive) - ${fieldKey}: found="${configValue}" via key="${matchingConfigKey}"`);
            }
          }
          
          // Strategy 3: Try common field name variations
          if (configValue === undefined) {
            const variations = [
              fieldKey.toUpperCase(),
              fieldKey.toLowerCase(),
              fieldKey.replace(/_/g, '').toLowerCase(),
              fieldKey.replace(/_/g, '').toUpperCase()
            ];
            
            for (const variation of variations) {
              if (currentConfig[variation] !== undefined) {
                configValue = currentConfig[variation];
                console.log(`Strategy 3 (variations) - ${fieldKey}: found="${configValue}" via variation="${variation}"`);
                break;
              }
            }
          }
          
          // Use found config value or fallback to default
          const finalValue = configValue !== undefined ? configValue : (configField.default || '');
          initialValues[fieldKey] = finalValue;
          
          console.log(`Field mapping FINAL - ${fieldKey}: configValue="${configValue}" default="${configField.default}" final="${finalValue}"`);
        });
        
        setFormValues(initialValues);
        setOriginalValues(initialValues);
        
        // Additional debug for storage_provider specifically
        if (fieldsData.storage_provider) {
          const storageField = fieldsData.storage_provider;
          console.log('=== STORAGE_PROVIDER DEBUG ===');
          console.log('Field definition:', storageField);
          console.log('Config keys available:', Object.keys(currentConfig));
          console.log('storage_provider in config?', 'storage_provider' in currentConfig);
          console.log('STORAGE_PROVIDER in config?', 'STORAGE_PROVIDER' in currentConfig);
          console.log('Current config storage_provider value:', currentConfig['storage_provider']);
          console.log('Final form value for storage_provider:', initialValues['storage_provider']);
          console.log('================================');
        }
      } catch (err) {
        console.error('Error fetching config data:', err);
        toast({
          description: 'Failed to fetch configuration data',
          variant: 'destructive',
          title: 'Loading Error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConfigData();
  }, []);

  const validateForm = () => {
    const errors: ValidationErrors = {};
    
    Object.entries(configFields).forEach(([key, field]) => {
      const value = formValues[key];
      
      // Check required fields
      if (field.required && (!value || value === '')) {
        errors[key] = 'This field is required';
      }
      
      // Check allowed values
      if (field.allowed_values && value && value !== '') {
        const stringValue = String(value);
        // For enum fields, compare in lowercase to handle case variations
        const normalizedValue = stringValue.toLowerCase();
        const normalizedAllowedValues = field.allowed_values.map(v => v.toLowerCase());
        
        if (!normalizedAllowedValues.includes(normalizedValue)) {
          errors[key] = `Value must be one of: ${field.allowed_values.join(', ')}`;
        }
      }
      
      // Type validation
      if (value && field.type === 'float') {
        const numValue = parseFloat(String(value));
        if (isNaN(numValue)) {
          errors[key] = 'Must be a valid number';
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (fieldName: string, value: FormValue) => {
    setFormValues(prev => {
      const newValues = {
        ...prev,
        [fieldName]: value
      };
      console.log(`Field ${fieldName} changed: ${prev[fieldName]} -> ${value}`);
      return newValues;
    });
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Convert form values to the format expected by the API
      const configData: {[key: string]: string | number | boolean | null} = {};
      Object.entries(formValues).forEach(([key, value]) => {
        const field = configFields[key];
        
        // Skip empty or null values unless they're explicitly set as defaults
        if (value === '' || value === null || value === undefined) {
          if (field.default !== null && field.default !== '') {
            configData[key] = field.default;
          }
          return;
        }
        
        let processedValue = value;
        
        // Handle different field types
        if (field.type === 'float' && value !== '') {
          processedValue = parseFloat(String(value));
        } else if (field.allowed_values && field.allowed_values.length > 0) {
          // For enum fields, handle different API expectation patterns
          const stringValue = String(value);
          
          // Fields that typically expect lowercase values
          const lowercaseFields = ['storage_provider', 'provider', 'region', 'environment'];
          const shouldBeLowercase = lowercaseFields.some(pattern => 
            key.toLowerCase().includes(pattern.toLowerCase())
          );
          
          if (shouldBeLowercase) {
            processedValue = stringValue.toLowerCase();
            console.log(`Lowercase field ${key}: input="${stringValue}" -> output="${processedValue}"`);
          } else {
            // For other enum fields, try to match the exact case from allowed_values
            const matchedValue = field.allowed_values.find(
              allowedValue => allowedValue.toLowerCase() === stringValue.toLowerCase()
            );
            processedValue = matchedValue || stringValue;
            console.log(`Enum field ${key}: input="${stringValue}" -> output="${processedValue}"`);
          }
        }
        
        configData[key] = processedValue;
      });
      
      console.log('Sending config data:', configData);
      
      await saveConfig(configData);
      
      // Update original values to current form values after successful save
      setOriginalValues({ ...formValues });
      
      toast({
        description: 'Configuration saved successfully!',
        variant: 'default',
        title: 'Success'
      });
    } catch (err: unknown) {
      console.error('Error saving config:', err);
      
      let errorMessage = 'Failed to save configuration';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorObj = err as { response?: { data?: { detail?: unknown; message?: string }; status?: number; statusText?: string } };
        const response = errorObj.response;
        
        if (response?.data) {
          if (response.data.detail) {
            if (Array.isArray(response.data.detail)) {
              const validationErrors = response.data.detail.map((error: { loc?: string[]; msg?: string; input?: unknown }) => 
                `${error.loc?.join('.')}: ${error.msg} (got: ${error.input})`
              ).join('\n');
              errorMessage = `Validation Error:\n${validationErrors}`;
            } else {
              errorMessage = String(response.data.detail);
            }
          } else if (response.data.message) {
            errorMessage = response.data.message;
          }
        } else if (response?.status) {
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast({
        description: errorMessage,
        variant: 'destructive',
        title: 'Save Failed'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormValues({ ...originalValues });
    setValidationErrors({});
    
    toast({
      description: 'Form reset to saved values',
      variant: 'default',
      title: 'Reset Complete'
    });
  };

  const getFieldTypeBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'str':
        return 'default';
      case 'float':
        return 'secondary';
      case 'lakesize':
      case 'storageprovider':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const renderField = (fieldName: string, field: ConfigField) => {
    const rawValue = formValues[fieldName];
    const value = rawValue !== null && rawValue !== undefined ? rawValue : '';
    const hasError = validationErrors[fieldName];
    
    console.log(`Rendering field ${fieldName}: rawValue="${rawValue}" value="${value}" (type: ${typeof rawValue})`);

    if (field.allowed_values && field.allowed_values.length > 0) {
      // For select fields, ensure the value matches one of the allowed values
      const stringValue = String(value || '');
      let matchedValue = '';
      
      if (stringValue) {
        // Try to find an exact match first
        matchedValue = field.allowed_values.find(option => option === stringValue) || '';
        
        // If no exact match, try case-insensitive match
        if (!matchedValue) {
          matchedValue = field.allowed_values.find(option => 
            option.toLowerCase() === stringValue.toLowerCase()
          ) || '';
        }
      }
      
      console.log(`Select field ${fieldName}: originalValue="${stringValue}" matchedValue="${matchedValue}" allowedValues=[${field.allowed_values.join(', ')}]`);
      
      return (
        <Select
          value={matchedValue}
          onValueChange={(newValue) => handleInputChange(fieldName, newValue)}
        >
          <SelectTrigger className={hasError ? 'border-Red' : ''}>
            <SelectValue placeholder="Select a value..." />
          </SelectTrigger>
          <SelectContent>
            {field.allowed_values.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    const inputType = field.type === 'float' ? 'number' : 'text';

    return (
      <Input
        type={inputType}
        step={field.type === 'float' ? '0.01' : undefined}
        value={String(value)}
        onChange={(e) => handleInputChange(fieldName, e.target.value)}
        placeholder={field.default ? `Default: ${field.default}` : 'Enter value...'}
        className={hasError ? 'border-Red focus:border-Red' : 'focus:border-primary'}
      />
    );
  };

  const hasUnsavedChanges = () => {
    return JSON.stringify(formValues) !== JSON.stringify(originalValues);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-foreground font-medium">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Settings className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-foreground">Configuration Management</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          View and modify your current system configuration settings. Changes will be applied across your organization.
        </p>
        
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl">Configuration Fields</CardTitle>
          <CardDescription>
            {Object.keys(configFields).length} fields available
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {Object.keys(configFields).length === 0 ? (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No configuration fields found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(configFields).map(([fieldName, field]) => (
                <Card key={fieldName} className="border-border">
                  <CardContent className="p-6">
                    {/* Field Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-foreground capitalize">
                          {field.alias || fieldName.replace(/_/g, ' ').toLowerCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          Field: {fieldName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {field.required && (
                          <Badge variant="destructive">Required</Badge>
                        )}
                        <Badge variant={getFieldTypeBadgeVariant(field.type)}>
                          {field.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Field Input */}
                    <div className="space-y-2">
                      <Label htmlFor={fieldName} className="text-foreground">
                        Value
                      </Label>
                      {renderField(fieldName, field)}
                      {validationErrors[fieldName] && (
                        <p className="text-Red text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {validationErrors[fieldName]}
                        </p>
                      )}
                    </div>

                    {/* Field Info */}
                    {(field.default !== null || (field.allowed_values && field.allowed_values.length > 0)) && (
                      <div className="mt-4 pt-4 border-t border-border">
                        {field.default !== null && (
                          <p className="text-xs text-muted-foreground mb-1">
                            <span className="font-medium">Default:</span> {String(field.default)}
                          </p>
                        )}
                        {field.allowed_values && field.allowed_values.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Options:</span> {field.allowed_values.join(', ')}
                            <br />
                            <span className="font-medium text-blue-600">Note:</span> 
                            {(() => {
                              const lowercaseFields = ['storage_provider', 'provider', 'region', 'environment'];
                              const shouldBeLowercase = lowercaseFields.some(pattern => 
                                fieldName.toLowerCase().includes(pattern.toLowerCase())
                              );
                              return shouldBeLowercase 
                                ? 'Values are sent to API in lowercase' 
                                : 'Values are sent exactly as shown';
                            })()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {Object.keys(configFields).length > 0 && (
            <div className="flex justify-end items-center mt-6 pt-6 border-t border-border">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={saving || !hasUnsavedChanges()}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Saved
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || Object.keys(validationErrors).length > 0 || !hasUnsavedChanges()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : hasUnsavedChanges() ? 'Save Changes' : 'No Changes'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ConfigPage;