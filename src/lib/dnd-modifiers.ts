import type { Modifier } from '@dnd-kit/core';

// Lock movement to the vertical axis to prevent any horizontal drift and the horizontal overflow.
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({
  ...transform,
  x: 0
});

export const restrictToParentElement: Modifier = ({
  containerNodeRect,
  draggingNodeRect,
  transform
}) => {
  if (!draggingNodeRect || !containerNodeRect) return transform;

  const value = { ...transform };

  if (draggingNodeRect.top + value.y <= containerNodeRect.top) {
    value.y = containerNodeRect.top - draggingNodeRect.top;
  } else if (
    draggingNodeRect.bottom + value.y >=
    containerNodeRect.top + containerNodeRect.height
  ) {
    value.y = containerNodeRect.top + containerNodeRect.height - draggingNodeRect.bottom;
  }

  if (draggingNodeRect.left + value.x <= containerNodeRect.left) {
    value.x = containerNodeRect.left - draggingNodeRect.left;
  } else if (draggingNodeRect.right + value.x >= containerNodeRect.left + containerNodeRect.width) {
    value.x = containerNodeRect.left + containerNodeRect.width - draggingNodeRect.right;
  }

  return value;
};
