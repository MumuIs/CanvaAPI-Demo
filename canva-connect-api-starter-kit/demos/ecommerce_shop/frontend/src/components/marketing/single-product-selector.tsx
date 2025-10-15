import { useEffect, useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import { useAppContext } from "src/context";
import type { Product } from "src/models";
import { getProducts } from "src/services";

export const SingleProductSelector = ({ disabled }: { disabled: boolean }) => {
  const { addAlert, selectedCampaignProduct, setSelectedCampaignProduct } =
    useAppContext();
  const [isFetching, setIsFetching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        try {
          const { products } = await getProducts();
          setProducts(products);
          setSelectedCampaignProduct(products[0]);
        } catch (error) {
          console.error(error);
          addAlert({
            title: "Something went wrong fetching products.",
            variant: "error",
          });
        }
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const selectedId = event.target.value as number;
    if (selectedId === 0) {
      setSelectedCampaignProduct({ id: 0, name: "空白画布", imageUrl: "", price: 0 });
      return;
    }
    const filteredProduct = products.find((product) => product.id === selectedId);
    setSelectedCampaignProduct(filteredProduct);
  };

  if (isFetching) {
    return <Skeleton variant="rounded" height={57} sx={{ marginBottom: 4 }} />;
  }

  if (!products) {
    return <Typography variant="h6">No products found.</Typography>;
  }

  return (
    <Box marginBottom={2}>
          <FormControl fullWidth={true}>
        <InputLabel id="product-select-label">Product</InputLabel>
        <Select
          label="Product"
          labelId="product-select-label"
          onChange={handleChange}
          value={selectedCampaignProduct?.id || ""}
          renderValue={() => selectedCampaignProduct?.name || ""}
          disabled={disabled}
        >
              <MenuItem value={0}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 28, height: 28 }}>□</Avatar>
                  <ListItemText primary="空白画布（不使用商品图片）" />
                </Stack>
              </MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={product.imageUrl} sx={{ width: 28, height: 28 }} />
                    <ListItemText primary={product.name} />
                  </Stack>
                </MenuItem>
              ))}
        </Select>
      </FormControl>
    </Box>
  );
};
