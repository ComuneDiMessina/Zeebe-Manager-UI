import Modeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from './custom/properties-provider';
import CustomModule from './custom';
import CustomModelingModule from './custom/modeling';
import zeebeModdleExtension from 'zeebe-bpmn-moddle/resources/zeebe';
import minimapModule from 'diagram-js-minimap';
import 'diagram-js-minimap/assets/diagram-js-minimap.css'; 

export default class CustomModeler extends Modeler {

  constructor(options) {

    var modelerOptions = {
      container: options.container,
      keyboard: { bindTo: document },
      propertiesPanel: {
        parent: options.propertiesPanel
      },
      moddleExtensions: {
        zeebe: zeebeModdleExtension
      }
    };
    super(modelerOptions);
  }

  resetZoom(callback) {
    var self = this;
    self.get('zoomScroll').reset();
  }
}

CustomModeler.prototype._modules = [
  ...CustomModeler.prototype._modules,
  CustomModule,
  propertiesPanelModule,
  propertiesProviderModule,
  CustomModelingModule,
  minimapModule
];