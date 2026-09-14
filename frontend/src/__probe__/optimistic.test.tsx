import { render, screen, act } from "@testing-library/react";
import { FC, startTransition, useOptimistic, useState } from "react";

let resolveRequest: () => void;
let request: Promise<void>;

const newRequest = () => {
  request = new Promise<void>((res) => {
    resolveRequest = res;
  });
};

const Demo: FC<{ mode: "sync" | "async" }> = ({ mode }) => {
  const [value, setValue] = useState("OFF");
  const [optimistic, setOptimistic] = useOptimistic(value);

  const go = () => {
    if (mode === "async") {
      // what we have now: mutateAsync + await
      startTransition(async () => {
        setOptimistic("ON");
        await request;
        setValue("ON");
      });
    } else {
      // the proposal: plain mutate(), nothing awaited
      startTransition(() => {
        setOptimistic("ON");
        request.then(() => setValue("ON"));
      });
    }
  };

  return (
    <>
      <span data-testid="v">{optimistic}</span>
      <button onClick={go}>go</button>
    </>
  );
};

describe("useOptimistic: does the optimistic value survive until the request finishes?", () => {
  test.each(["async", "sync"] as const)("%s transition", async (mode) => {
    newRequest();
    render(<Demo mode={mode} />);
    expect(screen.getByTestId("v").textContent).toBe("OFF");

    await act(async () => {
      screen.getByText("go").click();
    });

    const whileInFlight = screen.getByTestId("v").textContent;
    console.log(`  [${mode}] while request in flight -> "${whileInFlight}"`);

    await act(async () => {
      resolveRequest();
      await request;
    });

    console.log(`  [${mode}] after request resolved  -> "${screen.getByTestId("v").textContent}"`);
    expect(screen.getByTestId("v").textContent).toBe("ON");
  });
});
