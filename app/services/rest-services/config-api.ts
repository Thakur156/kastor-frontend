
import axiosInstance from "../axios-instance";

interface ConfigData {
	[key: string]: string | number | boolean | null;
}

export const getConfigFields = async () => {
	const response = await axiosInstance.get(`/config/config/fields`);
	return response.data;
};

export const getConfig = async () => {
	const response = await axiosInstance.get(`/config/config`);
	return response.data;
};

export const saveConfig = async (configData: ConfigData) => {
	console.log('saveConfig called with:', configData);
	console.log('Request URL:', `/config/save-config`);
	console.log('Request method: POST');
	console.log('Request body:', JSON.stringify(configData, null, 2));
	
	try {
		// Try with explicit headers to ensure proper JSON parsing
		const response = await axiosInstance.post(`/config/save-config`, configData, {
			headers: {
				'Content-Type': 'application/json',
			}
		});
		console.log('API Response:', response);
		console.log('Response data:', response.data);
		return response.data;
	} catch (error) {
		console.error('API Error details:', error);
		if (error.response) {
			console.error('Error response status:', error.response.status);
			console.error('Error response headers:', error.response.headers);
			console.error('Error response data:', error.response.data);
		}
		throw error;
	}
};
