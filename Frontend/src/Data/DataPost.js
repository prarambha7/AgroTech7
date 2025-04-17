export async function officerAddToBuyer(url, value) {
  const token = localStorage.getItem("token");
  return await axios
    .post(`${url}`, value, tokenHeader(token))
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err.response.data;
    });
}
