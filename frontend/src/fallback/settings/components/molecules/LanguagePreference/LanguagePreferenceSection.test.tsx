import { render } from "@testing-library/react";
import LanguagePreferenceSection from "./LanguagePreferenceSection";

describe("LanguagePreferenceSection", () => {
    it("renders without crashing", () => {
        const { container } = render(<LanguagePreferenceSection />);
        expect(container.firstChild).toBeDefined();
    });

    it("renders an empty fragment", () => {
        const { container } = render(<LanguagePreferenceSection />);
        expect(container.firstChild).toBeNull();
    });
});