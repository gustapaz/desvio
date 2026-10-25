import { render } from "preact";
import { App } from "./app.tsx";

const root = document.getElementById("app")!;
root.replaceChildren();
render(<App />, root);
