import { useState, useEffect } from "react";
import { DemoButton } from "src/components";
import { useAppContext } from "src/context";
import { getCanvaAuthorization, revoke } from "src/services";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { CanvaIcon } from "src/components";

export const ConnectButton = () => {
  const { isAuthorized, setToken, setDisplayName, addAlert, services } =
    useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAndSetDisplayName = async () => {
      const {
        profile: { display_name },
      } = await services.users.getUserProfile();
      display_name && setDisplayName(display_name);
    };

    if (isAuthorized) {
      try {
        getAndSetDisplayName();
      } catch (error) {
        console.error(error);
      }
    }
  }, [isAuthorized]);

  const onConnectClick = async () => {
    try {
      setIsLoading(true);
      const result = await getCanvaAuthorization();

      if (result) {
        setToken(result);

        addAlert({
          title: "已成功连接 Canva 集成",
          body: `你已完成登录。`,
          variant: "success",
          hideAfterMs: 5000,
        });
      } else {
        setToken(undefined);
      }
    } catch (error) {
      console.error(error);
      setToken(undefined);
      addAlert({
        title: "Authorization has failed. Please try again later.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRevokeClick = async () => {
    const result = await revoke();

    if (result) {
      setToken(undefined);
      setDisplayName("");
      addAlert({
        title: "已断开 Canva 集成连接",
        variant: "info",
      });
    }
  };

  return isAuthorized ? (
    <DemoButton
      demoVariant="destructive"
      startIcon={<LinkOffIcon />}
      onClick={onRevokeClick}
      fullWidth={true}
      sx={{ borderRadius: 2, py: 1.25 }}
    >
      断开 Canva
    </DemoButton>
  ) : (
    <DemoButton
      demoVariant="primary"
      startIcon={<CanvaIcon />}
      onClick={onConnectClick}
      loading={isLoading}
      fullWidth={true}
      sx={{ borderRadius: 2, py: 1.25 }}
    >
      连接 Canva
    </DemoButton>
  );
};
