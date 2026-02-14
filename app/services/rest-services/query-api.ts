import axiosInstance from "../axios-instance";
export const RunQueryApi = async (
  query: string,
  namespace: string,
  table: string,
  currentPage: number
) => {
  const response = await axiosInstance.post(
    `/datafusion/run-query?current_page=${
      currentPage ? currentPage : 1
    }&page_size=1000`,
    {
      hive_catalog_name: "default-catalog",
      datafusion_sql_query: query,
      mappings: [
        {
          iceberg_namespace_name: namespace,
          iceberg_table_name: table,
          datafusion_table_name: table,
        },
      ],
    }
  );
  return response.data;
};
