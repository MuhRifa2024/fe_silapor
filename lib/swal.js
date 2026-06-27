import Swal from "sweetalert2";

const swalAlert = Swal.mixin({
  customClass: {
    popup:
      "!bg-card !text-foreground border border-border rounded-2xl shadow-2xl font-sans",
    title: "!text-xl !font-bold !text-foreground",
    htmlContainer: "!text-muted-foreground !text-sm",
    confirmButton:
      "!bg-primary hover:!opacity-90 !text-primary-foreground !font-semibold !rounded-xl !px-5 !py-2.5 !transition-all !text-sm",
    cancelButton:
      "!bg-transparent !border !border-border !text-muted-foreground hover:!bg-muted hover:!text-foreground !font-semibold !rounded-xl !px-5 !py-2.5 !transition-all !text-sm",
    denyButton:
      "!bg-destructive hover:!opacity-90 !text-destructive-foreground !font-semibold !rounded-xl !px-5 !py-2.5 !transition-all !text-sm",
    actions: "!gap-3 !mt-6",
    icon: "!border-0",
  },
  buttonsStyling: false,
  showClass: {
    popup: "animate__animated animate__fadeInDown animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutUp animate__faster",
  },
});

export default swalAlert;
