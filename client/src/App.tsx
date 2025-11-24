import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PublicRegister from "./pages/PublicRegister";
import StoreDashboard from "./pages/store/StoreDashboard";
import StoreProducts from "./pages/store/StoreProducts";
import ProductForm from "./pages/store/ProductForm";
import StoreOrders from "./pages/store/StoreOrders";
import StoreAffiliates from "./pages/store/StoreAffiliates";
import StoreCoupons from "./pages/store/StoreCoupons";
import StoreLinks from "./pages/store/StoreLinks";
import StoreReports from "./pages/store/StoreReports";
import PublicStore from "./pages/PublicStore";
import Dashboard from "./pages/Dashboard";
import NewStore from "./pages/NewStore";
import StoreLogin from "./pages/StoreLogin";
import AdminLogin from "./pages/AdminLogin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/cadastrar" component={PublicRegister} />
      <Route path="/loja/:slug" component={PublicStore} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path="/admin/:storeId" component={StoreDashboard} />
      <Route path="/admin/:storeId/products" component={StoreProducts} />
      <Route path="/admin/:storeId/products/new" component={ProductForm} />
      <Route path="/admin/:storeId/products/:id/edit" component={ProductForm} />
      <Route path="/admin/:storeId/orders" component={StoreOrders} />
      <Route path="/admin/:storeId/affiliates" component={StoreAffiliates} />
      <Route path="/admin/:storeId/coupons" component={StoreCoupons} />
      <Route path="/admin/:storeId/links" component={StoreLinks} />
      <Route path="/admin/:storeId/reports" component={StoreReports} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/stores/new"} component={NewStore} />
      <Route path={"/new-store"} component={NewStore} />
      <Route path={"/store/login"} component={StoreLogin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
