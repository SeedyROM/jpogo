import React from "react";
import ReactDOM from "react-dom";

import {
  quantizationTableOffset,
  restartIntervalOffset,
  jpegToTypedArray,
  effectors
} from "./jpeg";

import "./styles.css";

function App() {
  /**
   * Application state
   */
  const [file, setFile] = React.useState("");
  const [bytes, setBytes] = React.useState(null);
  const [loading, setLoading] = React.useState(null);
  const [image, setImage] = React.useState(null);
  const [error, setError] = React.useState(null);

  /**
   * Convert a file into a TypedArray of Uint8s
   */
  const getBytes = async () => {
    setLoading(true);
    const data = await jpegToTypedArray(file);
    setBytes(data);
    setLoading(false);
  };

  /**
   * Handle the selected file updating
   * @param {object} event
   */
  const handleFileChange = event => {
    if (!event.target.value) return;

    const extension = event.target.value.split(".").pop();
    if (extension === "jpg" || extension === "jpeg") {
      setFile(event.target.files[0]);
    } else {
      setError("Image must be a JPEG");
    }
  };

  /**
   * Mutate the bytes of the jpeg images based on effector type
   * @param {string} type
   * @param {number} value
   * @param {number} offset
   */
  const manipulateBytes = (type, value, offset) => {
    let newBytes;

    switch (type) {
      case "dqt":
        const dqtOffset = quantizationTableOffset(bytes);
        newBytes = bytes.slice();
        newBytes[dqtOffset + offset] = Math.floor(value);
        setBytes(newBytes);
        break;

      case "dri":
        const driOffset = restartIntervalOffset(bytes);
        newBytes = bytes.slice();
        newBytes[driOffset + offset] = Math.floor(value);
        setBytes(newBytes);
        break;

      default:
        throw new Error("Invalid manipulation");
    }
  };

  /**
   * Update the bytes when the file changes
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    if (file) {
      getBytes();
    }
  }, [file]);
  /* eslint-enable react-hooks/exhaustive-deps */

  /**
   * Convert bytes into a visible image in the DOM
   */
  React.useEffect(() => {
    if (bytes && bytes.length) {
      setImage(
        "data:image/jpg;base64," +
          btoa(String.fromCharCode(...new Uint8Array(bytes)))
      );
    }
  }, [bytes]);

  /**
   * Generate effector controls
   */
  const effectorControls = Object.keys(effectors).map(type => {
    return Object.keys(effectors[type]).map(name => {
      console.log(type);
      const { max, min, offset } = effectors[type][name];
      console.log(max, min);
      return (
        <div className="manipulate">
          <label>{name.charAt(0).toUpperCase() + name.slice(1)}:</label>
          <input
            type="range"
            min={min}
            max={max}
            onChange={e => {
              manipulateBytes(type, parseInt(e.target.value, 10), offset);
            }}
          />
        </div>
      );
    });
  });

  return (
    <div className="App">
      <h1>JPOGO</h1>
      <input className="input" type="file" onChange={handleFileChange} />
      {error && <div className="error">{error}</div>}
      {loading === true && <div>Loading...</div>}
      {loading === false && (
        <>
          {effectorControls}
          <div className="preview">
            <img src={image} alt="Your Creation!" />
          </div>
        </>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
