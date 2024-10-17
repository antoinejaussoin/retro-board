const getCollapsedHeight = () => ({ height: 0, opacity: 0 });
const getRealHeight = (node: HTMLElement) => ({
  height: node.scrollHeight,
  opacity: 1,
});
const getCurrentHeight = (node: HTMLElement) => ({ height: node.offsetHeight });
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const skipOpacityTransition = (_: unknown, event: any) =>
  event.propertyName === 'height';

const collapseMotion = {
  motionName: 'rc-collapse-motion',
  onEnterStart: getCollapsedHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500,
  leavedClassName: 'rc-collapse-content-hidden',
};

export default collapseMotion;
