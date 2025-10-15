import { Typography, TextField } from "@mui/material";
import { FormPaper } from "src/components";
import { useCampaignContext } from "src/context";

export const CampaignNameInput = ({ disabled }: { disabled: boolean }) => {
  const { campaignName, setCampaignName } = useCampaignContext();
  return (
    <FormPaper>
      <Typography variant="h5" marginBottom={4}>
        请输入活动名称
      </Typography>
      <TextField
        id="campaign-name"
        label="活动名称"
        variant="outlined"
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        disabled={disabled}
        fullWidth={true}
        required={true}
      />
    </FormPaper>
  );
};
