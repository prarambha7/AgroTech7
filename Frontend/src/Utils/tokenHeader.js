export function tokenHeader(token) {
  const header = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return header;
}
