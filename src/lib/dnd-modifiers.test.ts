import type { Modifier } from '@dnd-kit/core';
import { describe, expect, it } from 'vitest';

import { restrictToParentElement, restrictToVerticalAxis } from './dnd-modifiers';

type Args = Parameters<Modifier>[0];

const transform = (x: number, y: number) => ({ x, y, scaleX: 1, scaleY: 1 });
const rect = (top: number, left: number, width: number, height: number) => ({
  top,
  left,
  width,
  height,
  right: left + width,
  bottom: top + height
});

// Hack to avoid having to provide all the properties of Args, which is a large type.
const run = (mod: Modifier, args: Partial<Args>) => mod(args as unknown as Args);

describe('dnd-modifiers', () => {
  const container = rect(0, 0, 100, 100);
  const dragging = rect(10, 10, 20, 20); // top10 bottom30 left10 right30

  it('should zero horizontal movement and keep the vertical delta', () => {
    expect(run(restrictToVerticalAxis, { transform: transform(25, 10) })).toEqual({
      x: 0,
      y: 10,
      scaleX: 1,
      scaleY: 1
    });
  });

  it('should return the transform unchanged when rects are missing', () => {
    expect(
      run(restrictToParentElement, {
        transform: transform(5, 5),
        draggingNodeRect: null,
        containerNodeRect: null
      })
    ).toEqual(transform(5, 5));
  });

  it('should leave a transform that stays within bounds untouched', () => {
    expect(
      run(restrictToParentElement, {
        transform: transform(5, 5),
        draggingNodeRect: dragging,
        containerNodeRect: container
      })
    ).toEqual(transform(5, 5));
  });

  it('should clamp movement past the top and bottom edges', () => {
    const up = run(restrictToParentElement, {
      transform: transform(0, -50),
      draggingNodeRect: dragging,
      containerNodeRect: container
    });
    expect(up.y).toBe(-10); // can't go above the container top

    const down = run(restrictToParentElement, {
      transform: transform(0, 100),
      draggingNodeRect: dragging,
      containerNodeRect: container
    });
    expect(down.y).toBe(70); // can't go below the container bottom
  });

  it('should clamp movement past the left and right edges', () => {
    const left = run(restrictToParentElement, {
      transform: transform(-50, 0),
      draggingNodeRect: dragging,
      containerNodeRect: container
    });
    expect(left.x).toBe(-10);

    const right = run(restrictToParentElement, {
      transform: transform(100, 0),
      draggingNodeRect: dragging,
      containerNodeRect: container
    });
    expect(right.x).toBe(70);
  });
});
