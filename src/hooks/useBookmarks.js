import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useBookmarks() {
  const queryClient = useQueryClient();

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => base44.entities.Bookmark.list(),
  });

  const bookmarkedWordIds = new Set(bookmarks.map(b => b.word_id));

  const addBookmark = useMutation({
    mutationFn: (wordId) => base44.entities.Bookmark.create({ word_id: wordId }),
    onMutate: async (wordId) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData(["bookmarks"]);
      queryClient.setQueryData(["bookmarks"], (old = []) => [...old, { word_id: wordId, id: `temp-${wordId}` }]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bookmarks"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const removeBookmark = useMutation({
    mutationFn: (wordId) => {
      const bookmark = bookmarks.find(b => b.word_id === wordId);
      if (bookmark) return base44.entities.Bookmark.delete(bookmark.id);
    },
    onMutate: async (wordId) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous = queryClient.getQueryData(["bookmarks"]);
      queryClient.setQueryData(["bookmarks"], (old = []) => old.filter(b => b.word_id !== wordId));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bookmarks"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const toggleBookmark = (wordId) => {
    if (bookmarkedWordIds.has(wordId)) {
      removeBookmark.mutate(wordId);
    } else {
      addBookmark.mutate(wordId);
    }
  };

  return { bookmarkedWordIds, toggleBookmark };
}