const clientId = '954eb26203664908999295d1dbbae56b';
const redirectURI = 'isyazwan_app.surge.sh';
let accessToken;
let expiresIn;
const Spotify = {

  getAccessToken(){
    if (accessToken){
      return accessToken;
    }else if(window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/) )
    {
     accessToken = window.location.href.match(/access_token=([^&]*)/)[1];
     expiresIn = window.location.href.match(/expires_in=([^&]*)/)[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    }else{
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  search(term){
    this.getAccessToken();

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => {
        return response.json();
    }).then(jsonResponse => {
      if (!jsonResponse.tracks){
        return [];
      }
      return jsonResponse.tracks.items.map(track =>({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }))
    });
  },

  savePlaylist(name, trackUri) {
    this.getAccessToken();

    if (!trackUri.length || !name){
      return;
    }

    const headers = {Authorization: `Bearer ${accessToken}`};
    var userId;
    var playlistId;

    return fetch (`https://api.spotify.com/v1/me`,{headers: headers})
    .then(response => response.json())
    .then(jsonResponse => {
      userId = jsonResponse.id;
      return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,{
        headers: headers,
        contentType: 'application/json',
        method: 'POST',
        body: JSON.stringify({name: name})
      }).then(response => response.json()
      ).then(jsonResponse => {
        const playlistId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,{
          headers: headers,
          contentType: 'application/json',
          method: 'POST',
          body: JSON.stringify({uris: trackUri})
      });
    });
  });
  }

};

export default Spotify;
