import axiosClient from "./api/axiosClient";
import postApi from "./api/postApi";

async function main() {
  //   const rep = await axiosClient.get("/posts");

  try {
    const queryParams = {
      _page: 1,
      _limit: 5,
    };
    const rep = await postApi.getAll(queryParams);
    console.log(rep);
  } catch (error) {
    console.log("Failed", error);
  }
}
main();
