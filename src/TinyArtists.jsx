import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { exportToBlob } from "@excalidraw/excalidraw";
import "./TinyArtists.css";
import Santa from "./assets/santa.jpg";
import Undo from "./assets/undo-btn.png";
import Back from "./assets/back-btn.png";
import Check from "./assets/check-btn.png";
import Settings from "./assets/settings-btn.png";
import red from "./assets/colors/red-color.png";
import blue from "./assets/colors/blue-color.png";
import darkblue from "./assets/colors/darkblue-color.png";
import lightgreen from "./assets/colors/lightgreen-color.png";
import purple from "./assets/colors/purple-color.png";
import yellow from "./assets/colors/yellow-color.png";
import green from "./assets/colors/green-color.png";
import darkgreen from "./assets/colors/darkgreen-color.png";
import pink from "./assets/colors/pink-color.png";
import orange from "./assets/colors/orange-color.png";
import cyan from "./assets/colors/cyan-color.png";
import indigo from "./assets/colors/indigo-color.png";
import turqise from "./assets/colors/turqise-color.png";
import lightpink from "./assets/colors/lightpink-color.png";
import magenta from "./assets/colors/magenta-color.png";
import plus from "./assets/plus.png";
import minus from "./assets/minus.png";

function TinyArtisits() {
  const [toggleLog, setToggleLog] = useState(false);
  const [toggleReg, setToggleReg] = useState(false);
  const [savedImg, setSavedImg] = useState(null);
  const [savedScene, setSavedScene] = useState(null);
  const [mainStage, setMainStage] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("black");
  const [startGame, setStartGame] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [chosenDrawing, setChosenDrawing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stageOne, setStageOne] = useState(false);
  const [stagetwo, setStageTwo] = useState(false);
  const ageRange = ["2-3", "3-5", "5-7", "7+"];
  const canvasRef = useRef(null);
  const [canvasApi, setCanvasApi] = useState(null);
  const [drawings, setDrawings] = useState([
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
    <img src={Santa} alt="" />,
  ]);
  const [userDrawings, setUserDrawigns] = useState([]);
  const [nameToggle, setNameToggle] = useState(false);
  const [loginCheckToggle, setLoginCheckToggle] = useState(false);
  const [nameAgeToggle, setNameAgeToggle] = useState(false);
  const [ageEmailToggle, setAgeEmailToggle] = useState(false);
  const colorPalete = [
    { color: "red", img: red },
    { color: "orange", img: orange },
    { color: "yellow", img: yellow },
    { color: "lightgreen", img: lightgreen },
    { color: "darkblue", img: darkblue },
    { color: "blue", img: blue },
    { color: "cyan", img: cyan },
    { color: "#40E0D0", img: turqise },
    { color: "indigo", img: indigo },
    { color: "purple", img: purple },
    { color: "#fa11ff", img: lightpink },
    { color: "#e64cff", img: pink },
    { color: "darkgreen", img: darkgreen },
    { color: "green", img: green },
    { color: "#bf1b6a", img: magenta },
  ];
  const UIOption = {
    canvasActions: {
      changeViewBackgroundColor: false,
      loadScene: false,
      saveToActiveFile: false,
      export: false,
      saveAsImage: false,
    },
  };
  ////////////////////////// user register and login-logout logic functions/////////////////////////////
  async function Register(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newEntry = Object.fromEntries(formData);
    newEntry.age = age;
    newEntry.username = name;
    console.log(newEntry);
    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const data = await response.json();
      if (response.ok) {
        alert("User registered successfully!");
        setCurrentUser(newEntry);
        toggleStageTwo();
      }
    } catch (error) {
      console.error("Error registering user.", error);
    }
  }
  async function Login(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const entry = Object.fromEntries(formData);
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Login Succsesful");
        localStorage.setItem("token", data.token);
        setCurrentUser(data.user);
        toggleStageTwo();
      }
    } catch (error) {
      console.error("login failed:", error);
    }
  }
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3001/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setCurrentUser(data.user);
          } else {
            localStorage.removeItem("token");
          }
        })
        .catch((err) => console.error("Token verification error:", err));
    }
  }, []);
  function Logout() {
    localStorage.removeItem("token");
    setCurrentUser(null);
    window.location.reload();
  }

  console.log(currentUser);
  //////////////////// Drawing Board Functions ///////////////////////////////
  function clearDrawing() {
    console.log(canvasApi);
    if (!canvasApi) {
      alert("no Api");
    }
    canvasApi.updateScene({ elements: [] });
  }
  function saveDrawing() {
    if (!canvasApi) return;
    setSavedScene(canvasApi.getSceneElements());
  }
  function loadDrawing() {
    if (!canvasApi) return;
    if (savedScene) {
      const current = canvasApi.getSceneElements();
      const mergeEelements = [...savedScene, ...current];
      console.log(current);
      canvasApi.updateScene({ elements: mergeEelements });
    }
  }
  async function DrawingToPng() {
    if (!canvasApi) return;
    const elements = canvasApi.getSceneElements();
    if (!elements || elements.length === 0) {
      alert("No drawing to save!");
      return;
    }
    try {
      const blob = await exportToBlob({
        excalidrawAPI: canvasApi,
        elements: canvasApi?.getSceneElements(),
        mimeType: "image/png",
        files: canvasApi?.getFiles(),
      });
      setSavedImg(window.URL.createObjectURL(blob));
    } catch (err) {
      console.error("Failed to export the drawing to a PNG:", err);
    }
  }
  useEffect(() => {
    if (savedImg) {
      console.log("image updated", savedImg);
      setUserDrawigns((prevDrawings) => {
        return [...prevDrawings, savedImg];
      });
      console.log(savedImg);
    }
  }, [savedImg]);
  function finishGame() {
    DrawingToPng();
    console.log(savedImg);
    toggleMainGame();
  }
  ///////////////////////////////////////Toggle Func ///////////////////////////////////////
  function toggleStartGame() {
    document.body.style.background =
      "url('src/assets/basic-nokid.jpg') no-repeat center center";
    document.body.style.backgroundSize = "cover";
    if (!currentUser) {
      setStageOne((prevState) => !prevState);
      setLoginCheckToggle((prevState) => !prevState);
    } else {
      toggleStageTwo();
    }
    setStartGame((prevState) => !prevState);
  }
  function toggleNameAge() {
    setNameAgeToggle((prevState) => !prevState);
    setNameToggle((prevState) => !prevState);
  }
  function toggleStageTwo() {
    setStageTwo((prevState) => !prevState);
    setToggleLog(false);
    setToggleReg(false);
  }
  function toggleMainGame() {
    setMainStage((prevState) => !prevState);
  }
  function toggleChoseDrawing(drawing) {
    setChosenDrawing(drawing);
    toggleStageTwo();
    toggleMainGame();
  }
  return (
    <>
      <header>
        {currentUser && (
          <div className="user-header">
            <div className="userData">
              <span>
                Hi {currentUser.username ? currentUser.username : "Guest"}
              </span>
            </div>
            <button onClick={Logout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>
      <main>
        {startGame && (
          <div className="start-screen">
            <button onClick={toggleStartGame} className="start-btn">
              Start
            </button>
          </div>
        )}
        {stageOne && (
          <>
            {loginCheckToggle && (
              <div className="login-check">
                <h2>
                  Hi There, <br />
                  Are You New to TinyArtists?
                </h2>
                <div className="login-check-btn">
                  <button
                    onClick={() => {
                      setToggleReg((prevState) => !prevState);
                      setNameToggle((prevState) => !prevState);
                      setLoginCheckToggle((prevState) => !prevState);
                    }}
                  >
                    Yes, <br />
                    lets get to know each other
                  </button>
                  <button
                    onClick={() => {
                      setToggleLog((prevState) => !prevState);
                      setLoginCheckToggle((prevState) => !prevState);
                    }}
                  >
                    no,
                    <br /> lets get Drawing!
                  </button>
                </div>
              </div>
            )}
            {toggleReg && (
              <div className="sign-up">
                <h3>Register</h3>
                <form onSubmit={Register}>
                  <div className="name-age-choice">
                    {nameToggle && (
                      <div className="name-screen">
                        <span>CHOOSE YOUR NAME</span>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                          }}
                        />
                        <button onClick={toggleNameAge} type="button">
                          SUBMIT
                        </button>
                      </div>
                    )}
                    {nameAgeToggle && (
                      <div className="age-screen">
                        <span>CHOOSE YOUR AGE</span>
                        <div className="age-container">
                          {ageRange.map((item, index) => {
                            return (
                              <button
                                type="button"
                                className="age-choice"
                                key={index}
                                onClick={() => setAge(item)}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                        {age && (
                          <button
                            type="button"
                            onClick={() => {
                              setNameAgeToggle((prevState) => !prevState);
                              setAgeEmailToggle((prevState) => !prevState);
                            }}
                          >
                            SUBMIT
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {ageEmailToggle && (
                    <div className="email-password-reg">
                      <div className="email-password-reg-input">
                        <span>ENTER E-MAIL:</span>
                        <input type="email" name="email" required />
                        <span>ENTER NEW PASSWORD:</span>
                        <input type="password" name="password" required />
                      </div>
                      <button type="submit">SUBMIT</button>
                    </div>
                  )}
                </form>
              </div>
            )}
            {toggleLog && (
              <div className="login">
                <h3>Login</h3>
                <form onSubmit={Login}>
                  <input type="email" name="email" placeholder="enter email" />
                  <input
                    type="password"
                    name="password"
                    placeholder="enter password"
                  />
                  <button type="submit">Submit</button>
                </form>
              </div>
            )}
          </>
        )}
        {stagetwo && (
          <div className="drawing-choice">
            {drawings.map((drawing, index) => {
              return (
                <button
                  key={index}
                  className="drawing"
                  onClick={() => toggleChoseDrawing(drawing)}
                >
                  {drawing}
                </button>
              );
            })}
          </div>
        )}
        {chosenDrawing && mainStage && (
          <div className="main-game">
            <div className="drawing-board">
              <div className="chosen-drawing">{chosenDrawing}</div>

              <div className="control-panel">
                <div className="control-panel-func">
                  <button onClick={finishGame}>Next</button>
                  <button onClick={clearDrawing}>
                    <img src={Back} alt="" />
                  </button>
                  <button onClick={() => canvasRef.current.undo()}>
                    <img src={Undo} alt="" />
                  </button>
                  <button onClick={saveDrawing}>
                    <img src={plus} alt="" />
                  </button>
                  <button onClick={loadDrawing}>
                    <img src={minus} alt="" />
                  </button>
                </div>
              </div>
              <div className="canvas">
                <Excalidraw
                  excalidrawAPI={(api) => setCanvasApi(api)}
                  UIOptions={UIOption}
                  gridModeEnabled={true}
                  initialData={{
                    appState: {
                      activeTool: { type: "freedraw" },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}
        {!mainStage && chosenDrawing && (
          <div className="user-drawings">
            <h2 className="gallery-title">
              {currentUser.username
                ? currentUser.username.toUpperCase()
                : "Guest"}{" "}
              GALLERY
            </h2>
            <div className="drawings-contianer">
              {userDrawings &&
                userDrawings.map((drawing, index) => {
                  return (
                    <img
                      className="user-drawing"
                      key={index}
                      src={drawing}
                      alt={`User drawing ${index}`}
                      onError={() =>
                        console.log("Image failed to load:", drawing)
                      }
                    />
                  );
                })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default TinyArtisits;
