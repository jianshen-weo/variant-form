export const cardSchema = {
  type: 'card',
  category: 'container',
  icon: 'card',
  widgetList: [],
  options: {
    name: '',
    label: 'card',
    hidden: false,
    folded: false,
    showFold: true,
    cardWidth: '100%',
    shadow: 'never',
    customClass: '',
  },
};

export const alertSchema = {
  type: 'alert',
  icon: 'alert',
  formItemFlag: false,
  options: {
    name: '',
    title: 'Good things are coming...',
    type: 'info',
    description: '',
    closable: true,
    closeText: '',
    center: true,
    showIcon: false,
    effect: 'light',
    hidden: false,
    onClose: '',
    customClass: '',
  },
};

export const linkSchema = {
  type: 'link',
  icon: 'link',
  formItemFlag: false,
  options: {
    name: '',
    title: '超链接',
    type: 'info',
    underline: true,
    disabled: false,
    href: '',
    icon: '',
    target: '_blank',
    hidden: false,
    onClick: '',
    customClass: '',
  },
};
