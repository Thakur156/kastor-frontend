// PostgresSQL Connection API

import axiosInstance from "../axios-instance";

interface dbDetailsTypes {
  dataset_name: string;
  host: string;
  port: number | string;
  dbname: string;
  user: string;
  password: string;
  sslmode: string;
}

interface mySqlDbDetailsTypes {
  host: string;
  user: string;
  passwd: string;
  port: string;
  db: string;
  connect_timeout: number;
  charset: string;
  autocommit: boolean;
  use_unicode: boolean;
}

export const postgresConnection = async (
  action: "test" | "ingest" | "view",
  db_detail: dbDetailsTypes,
  selectedTables?: { [key: string]: string[] }
) => {
  if (action === "ingest" && !selectedTables) {
    throw new Error("Please select tables to ingest");
  }
  const response = await axiosInstance.post(`/connectors/postgres/${action}`, {
    db_details: db_detail,
    action: action,
    ingest_payload: {
      tables_columns_dict: selectedTables || {},
    },
  });
  return response.data;
};

export const getUploadStatus = async (userId: string) => {
  const response = await axiosInstance.get(
    `/connectors/upload/status?user_id=${userId}`
  );
  return response.data;
};

export const sqlConnection = async (
  action: "test" | "ingest" | "view",
  db_detail: mySqlDbDetailsTypes,
  selectedTables?: { [key: string]: string[] }
) => {
  if (action === "ingest" && !selectedTables) {
    throw new Error("Please select tables to ingest");
  }
  const response = await axiosInstance.post(`/connectors/mysql/${action}`, {
    db_details: db_detail,
    action: action,
    ingest_payload: {
      tables_columns_dict: selectedTables || {},
    },
  });
  return response.data;
};

export const listConnectors = async () => {
  const response = await axiosInstance.get(
    `connectors/manager/list-connectors`
  );
  return response.data;
};
