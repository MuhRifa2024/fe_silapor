import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// Konfigurasi standar adaptif (Light/Dark Mode)
export const swalAlert = MySwal.mixin({
  customClass: {
    popup: "bg-card text-foreground border border-border rounded-xl shadow-2xl",
    title: "text-xl font-bold text-foreground",
    htmlContainer: "text-muted-foreground text-sm",
    confirmButton: "bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg px-5 py-2.5 transition-colors",
    cancelButton: "bg-transparent border border-border text-muted-foreground hover:bg-muted hover:text-foreground font-medium rounded-lg px-5 py-2.5 transition-colors",
    actions: "gap-3 mt-6",
  },
  background: "var(--card)",
  color: "var(--foreground)",
  buttonsStyling: false,
});

export default swalAlert;
