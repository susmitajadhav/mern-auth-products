export const createAuthFetch = ({ getAccessToken, refresh, logout }) => {
  return async (url, options = {}) => {
    const token = getAccessToken();

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // access token expired
      if (res.status === 401) {
        const newToken = await refresh();

        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
      }

      return res;
    } catch (err) {
      await logout();
      throw err;
    }
  };
};
