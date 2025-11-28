import { forwardRef } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import { Dialog, Slide } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { BrandTemplateSelector } from "src/components";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<HTMLElement>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const BrandTemplateSelectionModal = ({
  isOpen,
  setIsOpen,
  brandTemplates,
  singleSelect = false,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  brandTemplates: BrandTemplate[];
  singleSelect?: boolean;
}) => (
  <Dialog
    maxWidth="xl"
    open={isOpen}
    onClose={() => setIsOpen(false)}
    TransitionComponent={Transition}
    PaperProps={{ sx: { bgcolor: "black" } }}
    scroll="paper"
  >
    <BrandTemplateSelector
      onClose={() => setIsOpen(false)}
      brandTemplates={brandTemplates}
      singleSelect={singleSelect}
    />
  </Dialog>
);
