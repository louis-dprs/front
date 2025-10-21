<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
  modelValue?: boolean;
  disabled?: boolean;
  srcDisabled?: string;
  srcHover?: string;
  srcSelected?: string;
  srcNormal?: string;
  to?: string;
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  modelValue: false,
  disabled: false,
  srcDisabled: "resources/Button_Disabled.png",
  srcHover: "resources/Button_Hover.png",
  srcSelected: "resources/Button_Selected.png",
  srcNormal: "resources/Button_Normal.png",
  to: "",
});

const router = useRouter();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "click"): void;
}>();

const isHovered = ref(false);

type ButtonState = "disabled" | "hover" | "selected" | "normal";

const currentState = computed<ButtonState>(() => {
  if (props.disabled) return "disabled";
  if (props.modelValue) return "selected";
  if (isHovered.value) return "hover";
  return "normal";
});

function handleClick() {
  emit("update:modelValue", !props.modelValue);
  emit("click");
  if (props.to) {
    router.push(props.to);
  }
}
</script>

<template>
  <Primitive
    data-slot="menu-button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant, size }),
        props.class,
        'relative bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent p-0 border-none shadow-none outline-none ring-0'
      )
    "
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="handleClick"
  >
    <!-- Images superposées -->
    <img
      :src="props.srcNormal"
      alt=""
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
      :class="{
        'opacity-0': currentState !== 'normal',
        'opacity-100': currentState === 'normal',
      }"
    />
    <img
      :src="props.srcDisabled"
      alt=""
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
      :class="{
        'opacity-0': currentState !== 'disabled',
        'opacity-100': currentState === 'disabled',
      }"
    />
    <img
      :src="props.srcHover"
      alt=""
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
      :class="{
        'opacity-0': currentState !== 'hover',
        'opacity-100': currentState === 'hover',
      }"
    />
    <img
      :src="props.srcSelected"
      alt=""
      class="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
      :class="{
        'opacity-0': currentState !== 'selected',
        'opacity-100': currentState === 'selected',
      }"
    />

    <!-- Slot texte centré -->
    <span class="relative z-10 flex items-center justify-center w-full h-full">
      <slot />
    </span>
  </Primitive>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
