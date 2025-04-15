import { type ToastProps } from "@/components/ui/toast";
import { useToast as useToastPrimitive, toast } from "@/components/ui/use-toast";

export { type ToastProps, toast };

export function useToast() {
  return useToastPrimitive();
}