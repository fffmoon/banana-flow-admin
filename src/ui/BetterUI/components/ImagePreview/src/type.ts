export interface ImageProps {
  src: string
  alt?: string
  width?: string
  height?: string
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  fullscreenObjectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

export interface IPreviewOptions extends Pick<ImageProps, 'src' | 'alt' | 'objectFit'> {

}
