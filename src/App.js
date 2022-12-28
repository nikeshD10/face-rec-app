import "./App.css";
import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import ParticlesBg from "particles-bg";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      boxes: [],
      route: "signin",
      isSignedIn: false,
    };
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  calculateFaceLocation = (result) => {
    const numOfFace = result.outputs[0].data.regions.length;
    const image = document.getElementById("inputImage");
    const regionsTemp = [];
    for (let i = 0; i < numOfFace; i++) {
      const region = result.outputs[0].data.regions[i].region_info.bounding_box;
      regionsTemp.push(this.convertIntoPixels(region, image));
    }
    this.setState({ boxes: regionsTemp });
  };

  convertIntoPixels = (regionInPercent, image) => {
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: regionInPercent.left_col * width,
      topRow: regionInPercent.top_row * height,
      rightCol: width - regionInPercent.right_col * width,
      bottomRow: height - regionInPercent.bottom_row * height,
    };
  };

  onSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    //////////////////////////////////////////////////////////////////////////////////////////
    // In this section, we set the user authentication, app ID, model details, and the URL
    // of the image we want as an input. Change these strings to run your own example.
    /////////////////////////////////////////////////////////////////////////////////////////

    const USER_ID = "YOUR_USER_ID";
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = "YOUR_PAT";
    const APP_ID = "YOUR_APP_ID";
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = "face-detection";
    const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";
    const IMAGE_URL = this.state.input;

    ///////////////////////////////////////////////////////////////////////////////////
    // YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
    ///////////////////////////////////////////////////////////////////////////////////

    const raw = JSON.stringify({
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      inputs: [
        {
          data: {
            image: {
              url: IMAGE_URL,
            },
          },
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    };

    // NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
    // https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
    // this will default to the latest version_id

    fetch(
      "https://api.clarifai.com/v2/models/" +
        MODEL_ID +
        "/versions/" +
        MODEL_VERSION_ID +
        "/outputs",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => this.calculateFaceLocation(result))
      .catch((error) => console.log("error", error));
  };

  onRouteChange = (route) => {
    this.setState({ route: route });
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
  };

  render() {
    const { isSignedIn, imageUrl, route, boxes } = this.state;
    return (
      <div className="App">
        <ParticlesBg type="cobweb" color="#FFFFFF" bg={true} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onSubmit={this.onSubmit}
            />
            <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
          </>
        ) : route === "register" ? (
          <Register onRouteChange={this.onRouteChange} />
        ) : (
          <SignIn onRouteChange={this.onRouteChange} />
        )}
      </div>
    );
  }
}
