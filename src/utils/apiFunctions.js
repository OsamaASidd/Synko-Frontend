import axios from "axios";
import { api } from "./api";
import requestHeader from "./requestHeader";
import Cookies from "js-cookie";

const getErrors = (error) => {
  let message;
  if (
    typeof error === "object" &&
    error !== null &&
    !error.message &&
    error.messages
  ) {
    message = Object.values(error.messages)[0][0];
    return message;
  } else {
    message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.errors[0].message ||
      error.toString();
    return message;
  }
};

const postRequest = (url, data, method = "post", ignore = false) => {
  let config = {
    method: method,
    url: ignore == true ? api + url : api + "/user" + url,
    headers: requestHeader(),
    data: data,
  };
  return axios(config);
};

//temp requesting on post
const postRequestpos = (url, data, method = "post") => {
  let config = {
    method: method,
    url: api + "/pos/v1" + url,
    headers: requestHeader(),
    data: data,
  };
  return axios(config);
};

const getRequest = (url, ignore = false) => {
  let config = {
    method: "get",
    url: ignore == true ? api + url : api + "/user" + url,
    headers: requestHeader(),
  };
  return axios(config);
};

const request = (url, data = null, method = "post") => {
  let config = {
    method: method,
    url: url,
    headers: requestHeader(),
  };
  if (data) {
    config.data = data;
  }
  return axios(config);
};

export { postRequest, getRequest, getErrors, postRequestpos, request };
