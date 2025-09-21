import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => void;
  disabled?: boolean;
  triggerVariant?: "ghost" | "outline" | "destructive" | "default" | "secondary";
  triggerSize?: "sm" | "default" | "lg" | "icon";
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function DeleteConfirmationDialog({
  title = "Confirmar exclusão",
  description,
  itemName,
  onConfirm,
  disabled = false,
  triggerVariant = "ghost",
  triggerSize = "sm",
  showIcon = true,
  children,
}: DeleteConfirmationDialogProps) {
  const defaultDescription = itemName
    ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
    : "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant={triggerVariant}
            size={triggerSize}
            disabled={disabled}
          >
            {showIcon && <Trash2 className="h-4 w-4" />}
            {triggerSize !== "icon" && !showIcon && "Excluir"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
