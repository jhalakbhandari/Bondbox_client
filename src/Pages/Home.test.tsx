import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import Home from "./Home";
import { MemoryRouter } from "react-router-dom";
test("renders Bondbox heading", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  expect(screen.getByText(/Bondbox/i)).toBeInTheDocument();
});
test("Two buttons", async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(2);
});

test("Create Room button", async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const [createRoomButton] = screen.getAllByRole("button", {
    name: /Create a/i,
  });
  expect(createRoomButton).toBeInTheDocument();
});

test("Join Room button", async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const [joinButton] = screen.getAllByRole("button", { name: /Join a/i });
  expect(joinButton).toBeInTheDocument();
});
