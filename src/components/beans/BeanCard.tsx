"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import { deleteBean } from "@/actions/beans";
import {
  ROAST_LEVEL_LABELS,
  getTasteXLabel,
  getRoastYLabel,
  type RoastLevel,
} from "@/types";

interface BeanCardProps {
  bean: {
    id: string;
    name: string;
    roastLevel: string;
    origin: string | null;
    variety: string | null;
    process: string | null;
    memo: string | null;
    tasteX: number;
    roastY: number;
  };
}

export function BeanCard({ bean }: BeanCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteBean(bean.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("豆を削除しました");
        router.refresh();
      }
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{bean.name}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/beans/${bean.id}/edit`} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {ROAST_LEVEL_LABELS[bean.roastLevel as RoastLevel]}
            </Badge>
            {bean.origin && <Badge variant="outline">{bean.origin}</Badge>}
          </div>

          {(bean.variety || bean.process) && (
            <div className="text-sm text-muted-foreground space-y-1">
              {bean.variety && <p>品種: {bean.variety}</p>}
              {bean.process && <p>精製: {bean.process}</p>}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">渋み ↔ 酸味</span>
              <span>{getTasteXLabel(bean.tasteX)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">焙煎度</span>
              <span>{getRoastYLabel(bean.roastY)}</span>
            </div>
          </div>

          {bean.memo && (
            <p className="text-sm text-muted-foreground line-clamp-2">{bean.memo}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>豆を削除しますか？</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。「{bean.name}」を削除します。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
