import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { usePeopleStore } from "~community/people/store/store";

const LoginCredentialsModal = () => {
  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "credentials"
  );
  const { sharedCredentialData } = usePeopleStore((state) => state);

  const firstName = sharedCredentialData?.firstName ?? "";
  const lastName = sharedCredentialData?.lastName ?? "";
  const employeeCredentials = sharedCredentialData?.employeeCredentials ?? {
    email: "",
    tempPassword: ""
  };

  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const baseUrl = `${url.protocol}//${url.host}`;
  const loginUrl = `${baseUrl}/signin`;

  const handleCopyText = () => {
    const textToCopy = [
      translateText(["sectionOne"]),
      translateText(["sectionTwo"], { name: userName() }),
      translateText(["sectionThree"]),
      translateText(["loginUrl"], { link: loginUrl }),
      translateText(["username"], { username: employeeCredentials.email }),
      translateText(["password"], {
        password: employeeCredentials.tempPassword
      }),
      translateText(["sectionFive"])
    ].join("\n");

    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Failed to copy text", err);
    });
  };

  const userName = () => {
    return `${firstName} ${lastName}`.trim();
  };

  return (
    <div className="flex flex-col gap-3 mt-2">
      <p>{translateText(["sectionOne"])}</p>

      <p>
        {translateText(["sectionTwo"], {
          name: userName() ?? ""
        })}
      </p>

      <p>{translateText(["sectionThree"])}</p>

      <div>
        <p>{translateText(["loginUrl"], { link: loginUrl })}</p>
        <p>
          {translateText(["username"], {
            username: employeeCredentials.email
          })}
        </p>
        <p>
          {translateText(["password"], {
            password: employeeCredentials.tempPassword
          })}
        </p>
      </div>

      <p>{translateText(["sectionFive"])}</p>

      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"primary"}
          onClick={handleCopyText}
          icon={<Icon name={IconName.COPY_ICON} />}
          iconPosition="end"
        >
          {translateText(["copy"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default LoginCredentialsModal;
