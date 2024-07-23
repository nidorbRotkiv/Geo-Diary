import 'leaflet';

declare module "leaflet" {
  interface MaptilerLayerOptions {
    apiKey: string;
    style: string;
  }

  class MaptilerLayer extends L.Layer {
    constructor(options: MaptilerLayerOptions);
  }
}