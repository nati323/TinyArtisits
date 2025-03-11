import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TinyArtisits from "./TinyArtists.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TinyArtisits />
  </StrictMode>
);
