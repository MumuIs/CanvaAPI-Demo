import { Typography, Box, Stack, Dialog } from "@mui/material";
import { DemoButton, DeveloperNote } from "src/components";
import { useCampaignContext } from "src/context";

export const PublishDialog = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) => {
  const { campaignName } = useCampaignContext();

  return (
    <Dialog
      open={isOpen}
      onClose={() => onOpenChange(false)}
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: (t) => t.palette.background.paper,
          color: (t) => t.palette.text.primary,
          borderRadius: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: (t) => `0 8px 24px rgba(16,24,40,0.18)`,
        },
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        gap={2}
        paddingTop={6}
        paddingBottom={6}
      >
        <Box
          width={600}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <Typography variant="h6">Your campaign ‘{campaignName}’</Typography>
          <Typography variant="h6">has been published!</Typography>
        </Box>
        <Box width={400}>
          <Stack spacing={2}>
            <DeveloperNote info="提示：此为演示功能，活动不会实际发布到任何平台。" />
            <DemoButton
              demoVariant="primary"
              onClick={() => onOpenChange(false)}
            >
              CLOSE
            </DemoButton>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};
