import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "~/components/ui/use-toast";
import axiosInstance from "~/services/axios-instance";
import DatabaseIngestion from "./database-ingestion";

const SSL_OPTIONS = [
  { value: "allow", title: "Allow" },
  { value: "disabled", title: "Disabled" },
  { value: "prefer", title: "Prefer" },
  { value: "required", title: "Required" },
  { value: "verify-ca", title: "Verify CA" },
  { value: "verify-identity", title: "Verify Identity" },
];

// Define proper interfaces
interface ApiBodyField {
  [fieldName: string]: "string" | "number" | "boolean";
}

interface DatabaseConnection {
  name: string;
  imageUrl: string;
  type: string;
  API_Url: string;
  API_Body: ApiBodyField;
}

interface FormData {
  [key: string]: string | number | boolean;
}

// Match the interfaces expected by DatabaseIngestion
interface TableData {
  columns: string[];
  primary_keys: string[];
}

interface DatabaseData {
  [tableName: string]: TableData;
}

interface DbDetails {
  [key: string]: unknown;
}

interface DatabaseIngestionConnection {
  name: string;
  API_Url: string;
  [key: string]: unknown;
}

interface ResponseData {
  tables: DatabaseData;
  dbDetails: DbDetails;
}

const ConnectionDetails = ({ connection }: { connection: DatabaseConnection }) => {
  // Initialize formData with empty values, excluding 'sslmode'
  const [formData, setFormData] = useState<FormData>(
    Object.keys(connection.API_Body || {}).reduce((acc, key) => {
      if (key !== "sslmode") {
        acc[key] = ""; // Start with empty values
      }
      return acc;
    }, {} as FormData)
  );

  const [sslMode, setSslMode] = useState("");
  const [rootCertificate, setRootCertificate] = useState<File | null>(null);
  const [clientCertificate, setClientCertificate] = useState<File | null>(null);
  const [clientKey, setClientKey] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const [data, setData] = useState<ResponseData | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type: inputType } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: inputType === "number" ? Number(value) : value,
    }));
  };

  // Function to convert file to Base64
  function fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        // Convert data URL to Base64 string
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    });
  }

  // Handle radio value changes
  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "true",
    }));
  };

  // Validate if all fields are filled
  const isFormComplete =
    Object.values(formData).every(
      (value) => value !== "" && value !== undefined && value !== null
    ) &&
    (!("sslmode" in connection.API_Body) ||
      (sslMode !== "" &&
        ((sslMode !== "verify-ca" && sslMode !== "verify-identity") ||
          (rootCertificate && clientCertificate && clientKey))));

  // Function to build API body
  const buildApiBody = async () => {
    let apiBody = { ...formData };

    // Include SSL options if 'sslmode' is in API_Body
    if ("sslmode" in connection.API_Body) {
      apiBody.sslmode = sslMode;

      if (sslMode === "verify-ca" || sslMode === "verify-identity") {
        // Convert files to Base64
        const sslrootcertFile = rootCertificate
          ? await fileToBase64(rootCertificate)
          : null;
        const sslcertFile = clientCertificate
          ? await fileToBase64(clientCertificate)
          : null;
        const sslkeyFile = clientKey ? await fileToBase64(clientKey) : null;

        apiBody = {
          ...apiBody,
          sslrootcertFile,
          sslcertFile,
          sslkeyFile,
        };
      }
    }

    return { db_details: apiBody };
  };

  // Handle Test Connection
  const handleTestConnection = async () => {
    if (!isFormComplete) {
      toast({
        description: "Please fill all fields before testing.",
        variant: "destructive",
      });
      return;
    }

    setTestLoading(true);
    try {
      const apiBody = await buildApiBody();

      const response = await axiosInstance.post(
        `${connection.API_Url}/test`,
        apiBody
      );

      return toast({
        description: response.data.message || "Test connection successful!",
      });
    } catch (error: unknown) {
      console.error("Test connection failed:", error);
      return toast({
        description: "Test connection failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Handle form submission (Connect)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormComplete) {
      toast({
        description: "Please fill all fields before submission.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const apiBody = await buildApiBody();

      const response = await axiosInstance.post(
        `${connection.API_Url}/view`,
        apiBody
      );

      setData({
        tables: response.data.data.tables,
        dbDetails: apiBody.db_details,
      });
      toast({
        description: response.data.message || "Connection successful!",
      });
    } catch (error: unknown) {
      console.error("API call failed:", error);
      toast({
        description: "Error connecting to database. Please try again!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Sort fields so that boolean types appear last
  const sortedFields = Object.entries(connection.API_Body || {}).sort(
    ([, typeA], [, typeB]) => {
      if (typeA === "boolean" && typeB !== "boolean") return 1;
      if (typeA !== "boolean" && typeB === "boolean") return -1;
      return 0;
    }
  );

  // Remove 'sslmode' from sortedFields if present, as we'll handle it separately
  const fieldsWithoutSSL = sortedFields.filter(([key]) => key !== "sslmode");

  return (
    <div className="my-5">
      {data ? (
        <DatabaseIngestion
          data={data.tables}
          connection={{
            name: connection.name,
            API_Url: connection.API_Url,
          } as DatabaseIngestionConnection}
          dbDetails={data.dbDetails}
        />
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-Black my-5">
            {connection.name} Details
          </h2>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fieldsWithoutSSL.map(([key, type]) => (
                <div key={key} className="flex flex-col gap-2">
                  <Label htmlFor={key} className="font-medium">
                    {key}
                  </Label>
                  {type === "number" ? (
                    <Input
                      id={key}
                      name={key}
                      type="number"
                      value={String(formData[key])}
                      onChange={handleInputChange}
                      placeholder={`Enter ${key}`}
                    />
                  ) : type === "boolean" ? (
                    <RadioGroup
                      value={String(formData[key])}
                      onValueChange={(value) => handleRadioChange(key, value)}
                      className="flex gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id={`${key}-true`} value="true" />
                        <Label htmlFor={`${key}-true`} className="text-sm">
                          True
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem id={`${key}-false`} value="false" />
                        <Label htmlFor={`${key}-false`} className="text-sm">
                          False
                        </Label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <Input
                      id={key}
                      name={key}
                      type="text"
                      value={String(formData[key])}
                      onChange={handleInputChange}
                      placeholder={`Enter ${key}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* SSL Options */}
            {"sslmode" in connection.API_Body && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">
                  SSL Configuration
                </h3>

                {/* SSL Mode Selection */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sslmode" className="font-medium">
                    SSL Mode
                  </Label>
                  <Select
                    value={sslMode}
                    onValueChange={(value) => {
                      setSslMode(value);
                    }}
                  >
                    <SelectTrigger className="">
                      <SelectValue placeholder="Select SSL Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {SSL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SSL Certificates and Keys */}
                {(sslMode === "verify-ca" || sslMode === "verify-identity") && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* SSL Root Certificate */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="rootCertificate" className="font-medium">
                        SSL Root Certificate
                      </Label>
                      <Input
                        type="file"
                        accept=".pem"
                        id="rootCertificate"
                        onChange={(e) => {
                          setRootCertificate(e.target.files?.[0] || null);
                        }}
                      />
                      {rootCertificate && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{rootCertificate.name}</p>
                          <Trash2
                            size={16}
                            onClick={() => setRootCertificate(null)}
                            className="cursor-pointer text-red-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* SSL Client Certificate */}
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="clientCertificate"
                        className="font-medium"
                      >
                        SSL Client Certificate
                      </Label>
                      <Input
                        type="file"
                        accept=".pem"
                        id="clientCertificate"
                        onChange={(e) => {
                          setClientCertificate(e.target.files?.[0] || null);
                        }}
                      />
                      {clientCertificate && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{clientCertificate.name}</p>
                          <Trash2
                            size={16}
                            onClick={() => setClientCertificate(null)}
                            className="cursor-pointer text-red-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* SSL Client Key */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="clientKey" className="font-medium">
                        SSL Client Key
                      </Label>
                      <Input
                        type="file"
                        accept=".pem"
                        id="clientKey"
                        onChange={(e) => {
                          setClientKey(e.target.files?.[0] || null);
                        }}
                      />
                      {clientKey && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{clientKey.name}</p>
                          <Trash2
                            size={16}
                            onClick={() => setClientKey(null)}
                            className="cursor-pointer text-red-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant={"secondary"}
                className="mt-4 w-44"
                onClick={handleTestConnection}
                disabled={testLoading}
              >
                {testLoading ? "loading..." : "Test Connection"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="primary"
                className="mt-4"
                disabled={loading}
              >
                {loading ? "loading..." : "View Tables"}
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ConnectionDetails;
