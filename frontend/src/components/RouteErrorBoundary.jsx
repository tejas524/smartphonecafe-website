import { Component } from "react";
import RouteError from "./RouteError.jsx";

/**
 * Route-level error boundary.
 *
 * Catches render-time exceptions thrown by the route it wraps and shows the
 * shared graceful fallback INSTEAD of unmounting the whole React tree (which is
 * what produces a white screen). It is intentionally scoped per route — never
 * placed around the entire app — so one failing route does not take the rest of
 * the site down with it.
 *
 * Props:
 *   onRetry  optional callback invoked after the boundary clears its error
 *            (used to also re-attempt a dynamic import).
 *   homeTo   destination for the "Go to homepage" link (default "/").
 */
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Development-only diagnostics. Never logged in production to avoid noise
    // and to avoid leaking internal details to end users' consoles.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[RouteErrorBoundary] caught:", error, info?.componentStack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return <RouteError onRetry={this.handleRetry} homeTo={this.props.homeTo} />;
    }
    return this.props.children;
  }
}
