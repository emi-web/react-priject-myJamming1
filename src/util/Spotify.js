let accessToken = "";
let expiresIn = 0;

const clientId = "PEGA_AQUI_TU_CLIENT_ID";
const redirectUri = "http://localhost:3000/";

const Spotify = {
  getAccessToken() {
    if (accessToken) return accessToken;

    const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (tokenMatch && expiresMatch) {
      accessToken = tokenMatch[1];
      expiresIn = Number(expiresMatch[1]);

      window.setTimeout(() => (accessToken = ""), expiresIn * 1000);
      window.history.pushState("Access Token", null, "/");

      return accessToken;
    }

    const authUrl =
      `https://accounts.spotify.com/authorize` +
      `?client_id=${clientId}` +
      `&response_type=token` +
      `&scope=playlist-modify-public` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location = authUrl;
  },

  search(term) {
    if (!term) return Promise.resolve([]);

    const token = Spotify.getAccessToken();
    return fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(
        term,
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((json) => {
        if (!json.tracks || !json.tracks.items) return [];

        return json.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || "Unknown",
          album: track.album?.name || "Unknown",
          uri: track.uri,
        }));
      });
  },

  savePlaylist(name, trackUris) {
    if (!name || !trackUris || trackUris.length === 0) {
      return Promise.resolve();
    }

    const token = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    let userId = "";
    let playlistId = "";

    return fetch("https://api.spotify.com/v1/me", { headers })
      .then((res) => res.json())
      .then((json) => {
        userId = json.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ name }),
        });
      })
      .then((res) => res.json())
      .then((json) => {
        playlistId = json.id;
        return fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ uris: trackUris }),
          },
        );
      });
  },
};

export default Spotify;
