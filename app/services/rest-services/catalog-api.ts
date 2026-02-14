import axiosInstance from "../axios-instance";
export const getNamespaces = async () => {
  const response = await axiosInstance.get(
    "/catalog/namespaces?user_id=0&catalog_name=hive_catalog_name"
  );
  return response.data;
};

export const getNameSpaceTables = async (namespace: string) => {
  const response = await axiosInstance.get(
    `/catalog/tables/${namespace}?user_id=0&catalog_name=hive_catalog_name`
  );
  return response.data;
};

export const getTableMetadata = async (namespace: string, table: string) => {
  const response = await axiosInstance.get(
    `/catalog/table/metadata?user_id=0&catalog_name=hive_catalog_name&namespace_name=${namespace}&table_name=${table}`
  );
  return response.data;
};

export const getTablePreviewdata = async (namespace: string, table: string) => {
  const response = await axiosInstance.get(
    `/catalog/table/preview?namespace_name=${namespace}&table_name=${table}&user_id=0&catalog_name=hive_catalog_name`
  );
  return response.data;
};

export const updateNamespaceName = async (
  namespace: string,
  newName: string
) => {
  const response = await axiosInstance.patch(
    `/catalog/namespace/${namespace}/rename/${newName}?user_id=0&catalog_name=hive_catalog_name`
  );
  return response.data;
};

export const updateTableName = async (
  namespace: string,
  table: string,
  newName: string
) => {
  const response = await axiosInstance.patch(
    `/catalog/namespace/${namespace}/table/${table}/rename/table/${newName}?user_id=0&catalog_name=hive_catalog_name`
  );
  return response.data;
};

export const deleteTable = async (namespace: string, table: string) => {
  const response = await axiosInstance.delete(
    `/catalog/namespace/${namespace}/table/${table}?catalog_name=hive_catalog_name`
  );
  return response.data;
};

export const deleteNamespace = async (namespace: string) => {
  const response = await axiosInstance.delete(
    `/catalog/namespace/delete/namespace-and-tables?namespace_name=${namespace}`
  );
  return response.data;
};
