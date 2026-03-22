import { UserProps } from "@/core/domain/entities/user";
import { UserSortKey } from "@/presentation/components/SortSelect";
import { useMemo, useState } from "react";

export function useSortedUsers(users: UserProps[]) {
  const [sortKey, setSortKey] = useState<UserSortKey>("name_asc");

  const sorted = useMemo(() => {
    const list = [...users];

    switch (sortKey) {
      case "name_asc":
        return list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      case "name_desc":
        return list.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));

      case "status_active":
        return list.sort((a, b) => Number(b.isActive) - Number(a.isActive));

      case "status_inactive":
        return list.sort((a, b) => Number(a.isActive) - Number(b.isActive));

      case "role_admin":
        return list.sort((a, b) =>
          a.role === b.role ? 0 : a.role === "ADMIN" ? -1 : 1,
        );

      case "role_user":
        return list.sort((a, b) =>
          a.role === b.role ? 0 : a.role === "USER" ? -1 : 1,
        );

      case "created_newest":
        return list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      case "created_oldest":
        return list.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      default:
        return list;
    }
  }, [users, sortKey]);

  return { sorted, sortKey, setSortKey };
}
