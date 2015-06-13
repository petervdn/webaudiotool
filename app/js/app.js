require.config({
    baseUrl: 'js',
    paths: {
        jquery: 					'lib/jquery-1.11.2',
        
        ModuleDefinitions: 			'patchwork/config/ModuleDefinitions',
        Utils: 						'patchwork/util/Utils',
        Module: 					'patchwork/core/Module',
        Connection: 				'patchwork/core/Connection',
        Patch: 						'patchwork/core/Patch',
        AudioContextManager: 		'patchwork/core/AudioContextManager',
        BufferManager:              'patchwork/core/buffer/BufferManager',
        Buffer:                     'patchwork/core/buffer/Buffer',
        PatchEvent: 				'patchwork/event/PatchEvent',
        AudioContextManagerEvent: 	'patchwork/event/AudioContextManagerEvent',
        BufferEvent:                'patchwork/event/BufferEvent',
        BufferManagerEvent:         'patchwork/event/BufferManagerEvent',
        ModuleEvent: 				'patchwork/event/ModuleEvent',
        ModuleCategories: 			'patchwork/enum/ModuleCategories',
        AttributeTypes: 			'patchwork/enum/AttributeTypes',
        ModuleTypes: 				'patchwork/enum/ModuleTypes',
        BufferManager:              'patchwork/core/buffer/BufferManager',
        
        Footer: 					'editor/Footer',
        Help: 						'editor/Help',        
        AbstractOverlayElement: 	'editor/AbstractOverlayElement',
        MenuConfig: 				'editor/MenuConfig',
        Header: 					'editor/Header',
        VisualModule:               'editor/patch/VisualModule',
        ConnectionsCanvas: 			'editor/patch/ConnectionsCanvas',
        ConnectionSelectionGrid:    'editor/patch/ConnectionSelectionGrid',
        ViewCode:                   'editor/code/ViewCode',
        LiveCode:                   'editor/code/LiveCode',
        CodeGenerator:              'editor/code/CodeGenerator',
        Tracking:                   'editor/net/Tracking',
        Share:                      'editor/net/Share',
        HeaderEvent: 				'editor/event/HeaderEvent',
        FooterEvent: 				'editor/event/FooterEvent',
        ConnectionsCanvasEvent: 	'editor/event/ConnectionsCanvasEvent',
        VisualModuleEvent: 			'editor/event/VisualModuleEvent',
        EditorUtils: 				'editor/util/EditorUtils',
        Point:                      'editor/util/Point',
        BufferList:                 'editor/buffer/BufferList',
        VisualBuffer:               'editor/buffer/VisualBuffer',
    }
});


requirejs(["Main"]);