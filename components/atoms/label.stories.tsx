import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';

const meta = {
  title: 'Atoms/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
    },
    htmlFor: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithHtmlFor: Story = {
  args: {
    children: 'Email',
    htmlFor: 'email',
  },
};

export const Required: Story = {
  args: {
    children: 'Required Field *',
  },
};

export const WithDescription: Story = {
  args: {
    children: 'Password',
    'aria-description': 'Must be at least 8 characters',
  },
}; 