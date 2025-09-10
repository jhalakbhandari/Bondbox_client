import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("renders Bondbox heading", () => {
  render(<App />);
  expect(screen.getByText(/Bondbox/i)).toBeInTheDocument();
});

test("Three buttons", async () => {
  render(<App />);
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(3);
});

test("Three buttons", async () => {
  render(<App />);
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(3);
});

test("Login button", async () => {
  render(<App />);
  const [navLoginButton] = screen.getAllByRole("button", { name: /Login/i });
  expect(navLoginButton).toBeInTheDocument();
});

test("form Login button exists", () => {
  render(<App />);
  const form = screen.getByPlaceholderText("Email").closest("div"); // container of inputs & login
  const loginButton = within(form!).getByRole("button", { name: /Login/i });
  expect(loginButton).toBeInTheDocument();
});

test("Signup button", async () => {
  render(<App />);
  const loginButton = screen.getByRole("button", { name: /Sign/i });
  expect(loginButton).toBeInTheDocument();
});

test("renders email and password inputs and allows typing", async () => {
  render(<App />);
  const user = userEvent.setup();

  // find the email & password inputs
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");

  // check that they are in the document
  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();

  // type into them
  await user.type(emailInput, "test@example.com");
  await user.type(passwordInput, "mypassword");

  // assert values
  expect(emailInput).toHaveValue("test@example.com");
  expect(passwordInput).toHaveValue("mypassword");
});
export function validateEmail(email:string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password:string) {
  // example rule: at least 8 chars, one number, one special char
  const re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
  return re.test(password);
}

describe("Email Validation", () => {
  test("accepts valid email", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  test("rejects invalid email", () => {
    expect(validateEmail("not-an-email")).toBe(false);
    expect(validateEmail("user@domain")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });
});

describe("Password Validation", () => {
  test("accepts strong password", () => {
    expect(validatePassword("MyPass123!")).toBe(true);
  });

  test("rejects short password", () => {
    expect(validatePassword("123")).toBe(false);
  });

  test("rejects password without number", () => {
    expect(validatePassword("Password!")).toBe(false);
  });

  test("rejects password without special character", () => {
    expect(validatePassword("Password123")).toBe(false);
  });
});
