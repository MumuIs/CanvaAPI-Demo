import type { RouteObject } from "react-router-dom";
import { CampaignContextProvider } from "src/context";
import {
  ErrorBoundaryPage,
  HomePage,
  MarketingPage,
  MultipleDesignsGeneratorPage,
  ProductsPage,
  ReturnNavPage,
  SingleDesignGeneratorPage,
  BrandTemplateCreatorPage,
  BrandTemplateTestPage,
  UploadsPage,
  ContentLibraryPage,
} from "src/pages";
import { App } from "../app";

export enum Paths {
  HOME = "/",
  RETURN_NAV = "/return-nav",
  MARKETING = "/marketing",
  MULTIPLE_DESIGNS_GENERATOR = "/marketing/multiple-designs",
  PRODUCTS = "/products",
  SINGLE_DESIGN_GENERATOR = "/marketing/single-design",
  BRAND_TEMPLATES = "/brand-templates",
  BRAND_TEMPLATES_TEST = "/brand-templates/test",
  UPLOADS = "/uploads",
  CONTENT_LIBRARY = "/content-library",
}

export const routes: RouteObject[] = [
  {
    path: Paths.HOME,
    element: <App />,
    errorElement: <ErrorBoundaryPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: Paths.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: Paths.MARKETING,
        element: <MarketingPage />,
      },
      {
        path: Paths.SINGLE_DESIGN_GENERATOR,
        element: (
          <CampaignContextProvider>
            <SingleDesignGeneratorPage />
          </CampaignContextProvider>
        ),
      },
      {
        path: Paths.BRAND_TEMPLATES,
        element: <BrandTemplateCreatorPage />,
      },
      {
        path: Paths.BRAND_TEMPLATES_TEST,
        element: <BrandTemplateTestPage />,
      },
      {
        path: Paths.UPLOADS,
        element: <UploadsPage />,
      },
      {
        path: Paths.CONTENT_LIBRARY,
        element: <ContentLibraryPage />,
      },
      {
        path: Paths.MULTIPLE_DESIGNS_GENERATOR,
        element: (
          <CampaignContextProvider>
            <MultipleDesignsGeneratorPage />
          </CampaignContextProvider>
        ),
      },
    ],
  },
  {
    path: Paths.RETURN_NAV,
    errorElement: <ErrorBoundaryPage />,
    element: <ReturnNavPage />,
  },
];
