import React from "react";
import "./App.css";

import SearchBar from "../SearchBar/SearchBar";
import SearchResults from "../SearchResults/SearchResults";
import Playlist from "../Playlist/Playlist";

import Spotify from "../../util/Spotify";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [], //
      playlistName: "New Playlist",
      playlistTracks: [],
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    const exists = this.state.playlistTracks.some((t) => t.id === track.id);
    if (exists) return;

    this.setState((prev) => ({
      playlistTracks: [...prev.playlistTracks, track],
    }));
  }

  removeTrack(track) {
    this.setState((prev) => ({
      playlistTracks: prev.playlistTracks.filter((t) => t.id !== track.id),
    }));
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackURIs = this.state.playlistTracks.map((t) => t.uri);
    Spotify.savePlaylist(this.state.playlistName, trackURIs).then(() => {
      this.setState({
        playlistName: "New Playlist",
        playlistTracks: [],
      });
    });
  }

  search(term) {
    Spotify.search(term).then((results) => {
      this.setState({ searchResults: results });
    });
  }

  render() {
    return (
      <div>
        <h1>
          Jammm<span className="highlight">ing</span>
        </h1>

        <div className="App">
          <SearchBar onSearch={this.search} />

          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
            />

            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
