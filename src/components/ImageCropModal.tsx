"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";

export const MEDIA_ASPECT = 16 / 9;

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => void;
};

export default function ImageCropModal({ file, onCancel, onConfirm }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null
  );

  const [src, setSrc] = useState("");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [frameSize, setFrameSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNat({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => {
      setFrameSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

  const coverScale =
    nat.w && nat.h && frameSize.w
      ? Math.max(frameSize.w / nat.w, frameSize.h / nat.h)
      : 1;
  const scale = coverScale * zoom;
  const displayW = nat.w * scale;
  const displayH = nat.h * scale;
  const left = (frameSize.w - displayW) / 2 + offset.x;
  const top = (frameSize.h - displayH) / 2 + offset.y;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    setOffset({
      x: drag.ox + (e.clientX - drag.x),
      y: drag.oy + (e.clientY - drag.y),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !nat.w || !frameSize.w) return;
    setBusy(true);
    try {
      let sx = -left / scale;
      let sy = -top / scale;
      let sw = frameSize.w / scale;
      let sh = frameSize.h / scale;

      sx = Math.max(0, Math.min(sx, nat.w - 1));
      sy = Math.max(0, Math.min(sy, nat.h - 1));
      sw = Math.max(1, Math.min(sw, nat.w - sx));
      sh = Math.max(1, Math.min(sh, nat.h - sy));

      const outW = Math.min(1920, Math.round(sw));
      const outH = Math.round(outW / MEDIA_ASPECT);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not crop image");
      ctx.fillStyle = "#0A0C0F";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
          "image/jpeg",
          0.92
        );
      });
      const cropped = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, "") + "-crop.jpg",
        { type: "image/jpeg" }
      );
      onConfirm(cropped);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Crop failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex
      position="fixed"
      inset={0}
      zIndex={1200}
      bg="rgba(0,0,0,0.82)"
      align="center"
      justify="center"
      p="20px"
    >
      <Box
        bg="background"
        border="1px solid"
        borderColor="border"
        maxW="760px"
        w="100%"
        p="22px"
      >
        <Text
          fontSize="12px"
          color="muted"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Crop image
        </Text>
        <Text mt="6px" mb="18px" fontSize="13px" color="secondary">
          16:9 frame — same format as the site. Drag to reposition, zoom to fill.
        </Text>

        <Box
          ref={frameRef}
          position="relative"
          w="100%"
          aspectRatio={`${MEDIA_ASPECT}`}
          overflow="hidden"
          border="1px solid"
          borderColor="border"
          borderRadius="10px"
          bg="#0A0C0F"
          cursor="grab"
          userSelect="none"
          sx={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNat({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              style={{
                position: "absolute",
                left: `${left}px`,
                top: `${top}px`,
                width: `${displayW}px`,
                height: `${displayH}px`,
                maxWidth: "none",
                pointerEvents: "none",
                opacity: nat.w ? 1 : 0,
              }}
            />
          )}
        </Box>

        <Flex align="center" gap="12px" mt="16px">
          <Text fontSize="11px" color="muted" minW="40px">
            Zoom
          </Text>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#8AA8FF" }}
          />
        </Flex>

        <Flex justify="flex-end" gap="10px" mt="22px">
          <Button variant="secondary" onClick={onCancel} isDisabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={confirm}
            isLoading={busy}
            isDisabled={!nat.w}
          >
            Crop & upload
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
