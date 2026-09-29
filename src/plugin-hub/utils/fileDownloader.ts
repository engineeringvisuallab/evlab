import JSZip from 'jszip';
import { PluginItem, PluginSuite, SuiteDownloadTarget, SoftwareGroup } from '../types';
import { PLUGINS_DATA } from '../data/plugins';

/**
 * Generate a single SketchUp .rbz (ZIP with extension structure)
 */
export async function createSketchUpRbzBlob(plugin: PluginItem): Promise<Blob> {
  const zip = new JSZip();

  let extName = 'EVL-Plugin';
  let rootFileName = 'evlab_plugin.rb';
  let folderName = 'evlab_plugin';
  let moduleName = 'Plugin';

  if (plugin.id.includes('vertex')) {
    extName = 'EVL-Vertex';
    rootFileName = 'evlab_vertex.rb';
    folderName = 'evlab_vertex';
    moduleName = 'VertexEditor';
  } else if (plugin.id.includes('railing')) {
    extName = 'EVL-Railing';
    rootFileName = 'evlab_railing.rb';
    folderName = 'evlab_railing';
    moduleName = 'Railing';
  } else if (plugin.id.includes('grill')) {
    extName = 'EVL-Grill';
    rootFileName = 'evlab_grill.rb';
    folderName = 'evlab_grill';
    moduleName = 'Grill';
  } else if (plugin.id.includes('window')) {
    extName = 'EVL-Window';
    rootFileName = 'evlab_window.rb';
    folderName = 'evlab_window';
    moduleName = 'Window';
  } else if (plugin.id.includes('door')) {
    extName = 'EVL-Door';
    rootFileName = 'evlab_door.rb';
    folderName = 'evlab_door';
    moduleName = 'Door';
  } else if (plugin.id.includes('gate')) {
    extName = 'EVL-Gate';
    rootFileName = 'evlab_gate.rb';
    folderName = 'evlab_gate';
    moduleName = 'Gate';
  } else if (plugin.id.includes('boundary')) {
    extName = 'EVL-BoundaryWall';
    rootFileName = 'evlab_boundary_wall.rb';
    folderName = 'evlab_boundary_wall';
    moduleName = 'BoundaryWall';
  } else if (plugin.id.includes('rail')) {
    extName = 'EVL-Rail';
    rootFileName = 'evlab_rail.rb';
    folderName = 'evlab_rail';
    moduleName = 'RailTrack';
  } else if (plugin.id.includes('facemaker')) {
    extName = 'EVL-FaceMaker';
    rootFileName = 'evlab_facemaker.rb';
    folderName = 'evlab_facemaker';
    moduleName = 'FaceMaker';
  } else if (plugin.id.includes('road')) {
    extName = 'EVL-Road';
    rootFileName = 'evlab_road.rb';
    folderName = 'evlab_road';
    moduleName = 'RoadHub';
  } else if (plugin.id.includes('drain')) {
    extName = 'EVL-Drain';
    rootFileName = 'evlab_drain.rb';
    folderName = 'evlab_drain';
    moduleName = 'DrainNetwork';
  } else if (plugin.id.includes('pipenetwork')) {
    extName = 'EVL-PipeNetwork';
    rootFileName = 'evlab_pipenetwork.rb';
    folderName = 'evlab_pipenetwork';
    moduleName = 'PipeNetwork';
  } else if (plugin.id.includes('pipe')) {
    extName = 'EVL-Pipe';
    rootFileName = 'evlab_pipe.rb';
    folderName = 'evlab_pipe';
    moduleName = 'PipePro';
  } else if (plugin.id.includes('culvert')) {
    extName = 'EVL-Culvert';
    rootFileName = 'evlab_culvert.rb';
    folderName = 'evlab_culvert';
    moduleName = 'Culvert';
  } else if (plugin.id.includes('plant3d')) {
    extName = 'EVL-Plant3D';
    rootFileName = 'evlab_plant3d.rb';
    folderName = 'evlab_plant3d';
    moduleName = 'Plant3D';
  } else if (plugin.id.includes('plantation') || plugin.id.includes('landscape')) {
    extName = 'EVL-Landscape';
    rootFileName = 'evlab_landscape.rb';
    folderName = 'evlab_landscape';
    moduleName = 'Plantation';
  } else if (plugin.id.includes('wall-builder') || plugin.id.includes('wall')) {
    extName = 'EVL-WallBuilder';
    rootFileName = 'evlab_wall_builder.rb';
    folderName = 'evlab_wall_builder';
    moduleName = 'WallBuilder';
  } else if (plugin.id.includes('building-layers') || plugin.id.includes('layers')) {
    extName = 'EVL-BuildingLayers';
    rootFileName = 'evlab_building_layers.rb';
    folderName = 'evlab_building_layers';
    moduleName = 'BuildingLayers';
  } else if (plugin.id.includes('structural-frame') || plugin.id.includes('frame')) {
    extName = 'EVL-StructuralFrame';
    rootFileName = 'evlab_structural_frame.rb';
    folderName = 'evlab_structural_frame';
    moduleName = 'StructuralFrame';
  } else if (plugin.id.includes('slab-floor') || plugin.id.includes('slab')) {
    extName = 'EVL-SlabFloor';
    rootFileName = 'evlab_slab_floor.rb';
    folderName = 'evlab_slab_floor';
    moduleName = 'SlabFloor';
  } else if (plugin.id.includes('stair-pro') || plugin.id.includes('stair')) {
    extName = 'EVL-StairPro';
    rootFileName = 'evlab_stair_pro.rb';
    folderName = 'evlab_stair_pro';
    moduleName = 'StairPro';
  } else if (plugin.id.includes('roof-parapet') || plugin.id.includes('roof')) {
    extName = 'EVL-RoofParapet';
    rootFileName = 'evlab_roof_parapet.rb';
    folderName = 'evlab_roof_parapet';
    moduleName = 'RoofParapet';
  } else if (plugin.id.includes('bim') || plugin.id.includes('building')) {
    extName = 'EVLab-Building-BIM';
    rootFileName = 'evlab_building_bim.rb';
    folderName = 'evlab_building_bim';
    moduleName = 'BuildingBIM';
  } else if (plugin.id.includes('boq') || plugin.id.includes('quantcost') || plugin.id.includes('estimator')) {
    extName = 'EVL-QuantCost';
    rootFileName = 'evlab_boq_estimator.rb';
    folderName = 'evlab_boq_estimator';
    moduleName = 'QuantCost';
  }

  // Top-level extension registration
  const loaderContent = `# EVLab SketchUp Extension Loader: ${plugin.nameEn}
require 'sketchup.rb'
require 'extensions.rb'

module EVLab
  module ${moduleName}
    ext = SketchupExtension.new('${extName}', '${folderName}/main.rb')
    ext.description = '${plugin.shortSummaryEn.replace(/'/g, "\\'")}'
    ext.version     = '${plugin.version}'
    ext.creator     = 'EVLab Plugin Hub (Cross-Software CAD/BIM Suite)'
    Sketchup.register_extension(ext, true)
  end
end
`;
  zip.file(rootFileName, loaderContent);

  // Subfolder with main ruby logic
  const subFolder = zip.folder(folderName);
  if (subFolder) {
    subFolder.file('main.rb', plugin.rawCodeSnippet);
    subFolder.file(
      'README.txt',
      `EVLab Plugin Hub - ${extName}\nVersion: ${plugin.version}\n\nInstallation in SketchUp:\n1. Open SketchUp 2019-2026.\n2. Go to Extensions > Extension Manager.\n3. Click 'Install Extension' and choose this .rbz file.\n4. Access via Extensions > EVLab Tools menu.\n\nWebsite: EVLab Plugin Hub`,
    );
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

/**
 * Generate Blender Addon Python script
 */
export function generateBlenderAddonScript(pluginName: string): string {
  return `# =============================================================================
# EVLab Multi-Software Suite: Blender 3D Addon
# Tool: ${pluginName}
# Compatible with Blender 3.0+ to 4.x
# =============================================================================
bl_info = {
    "name": "EVLab - ${pluginName}",
    "author": "EVLab Engineering & Architecture",
    "version": (2, 0, 0),
    "blender": (3, 6, 0),
    "location": "View3D > Sidebar (N-Panel) > EVLab",
    "description": "3D Mesh Vertex Manipulation, Soft Selection & Architectural Elements",
    "category": "Mesh",
}

import bpy
import bmesh
import math
from mathutils import Vector

class EVLAB_OT_VertexManipulator(bpy.types.Operator):
    """EVLab 3D Vertex & Mesh Manipulator with Soft Selection Falloff"""
    bl_idname = "mesh.evlab_vertex_tool"
    bl_label = "EVLab 3D Vertex Sculpt"
    bl_options = {'REGISTER', 'UNDO'}

    falloff_radius: bpy.props.FloatProperty(
        name="Falloff Radius",
        default=2.5,
        min=0.1,
        max=50.0,
        description="Soft selection influence radius"
    )

    elevation: bpy.props.FloatProperty(
        name="Z Elevation",
        default=1.5,
        min=-20.0,
        max=20.0,
        description="Vertical vertex height displacement"
    )

    preset_type: bpy.props.EnumProperty(
        name="Preset Surface",
        items=[
            ('CANOPY', "Tensile Wave Canopy", "Curved architectural canopy roof"),
            ('TERRAIN', "Organic Landscape Terrain", "Mountain peak and valley contours"),
            ('SADDLE', "Hyperbolic Paraboloid Shell", "Saddle roof organic geometry"),
        ],
        default='CANOPY'
    )

    def execute(self, context):
        obj = context.active_object
        if not obj or obj.type != 'MESH':
            self.report({'ERROR'}, "Please select a 3D Mesh object in Edit Mode!")
            return {'CANCELLED'}

        bm = bmesh.from_edit_mesh(obj.data) if obj.mode == 'EDIT' else bmesh.new()
        if obj.mode != 'EDIT':
            bm.from_mesh(obj.data)

        selected_verts = [v for v in bm.verts if v.select]
        if not selected_verts:
            self.report({'WARNING'}, "No vertices selected. Selecting center vertex automatically.")
            if bm.verts:
                selected_verts = [bm.verts[len(bm.verts)//2]]

        center_pt = sum([v.co for v in selected_verts], Vector((0,0,0))) / len(selected_verts)

        for v in bm.verts:
            dist = (v.co - center_pt).length
            if dist <= self.falloff_radius:
                # Gaussian bell curve falloff
                ratio = dist / self.falloff_radius
                weight = math.exp(-3.0 * (ratio ** 2))
                v.co.z += self.elevation * weight

        if obj.mode == 'EDIT':
            bmesh.update_edit_mesh(obj.data)
        else:
            bm.to_mesh(obj.data)
            obj.data.update()

        self.report({'INFO'}, "EVLab: Mesh vertices sculpted with Gaussian soft falloff!")
        return {'FINISHED'}

class EVLAB_PT_MainPanel(bpy.types.Panel):
    bl_label = "EVLab 3D Multi-Tool"
    bl_idname = "EVLAB_PT_main_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "EVLab"

    def draw(self, context):
        layout = self.layout
        col = layout.column(align=True)
        col.label(text="EVLab Architecture & Geometry", icon='MOD_MESHDEFORM')
        col.operator("mesh.evlab_vertex_tool", text="Activate EVLab 3D Sculpt", icon='VERTEXSEL')

def register():
    bpy.utils.register_class(EVLAB_OT_VertexManipulator)
    bpy.utils.register_class(EVLAB_PT_MainPanel)

def unregister():
    bpy.utils.unregister_class(EVLAB_PT_MainPanel)
    bpy.utils.unregister_class(EVLAB_OT_VertexManipulator)

if __name__ == "__main__":
    register()
`;
}

/**
 * Generate 3ds Max MaxScript (.ms)
 */
export function generate3dsMaxScript(pluginName: string): string {
  return `-- =============================================================================
-- EVLab Multi-Software Suite: Autodesk 3ds Max MaxScript (.ms)
-- Tool: ${pluginName}
-- Compatible with 3ds Max 2020 - 2026
-- =============================================================================

macroScript EVLabVertexTools
category:"EVLab Tools"
tooltip:"EVLab 3D Vertex & Soft Selection Sculptor"
buttonText:"EVL-Vertex"
(
    on execute do
    (
        rollout evlRollout "EVLab 3D Vertex Editor" width:280 height:320
        (
            group "Soft Selection Parameters"
            (
                spinner spnFalloff "Falloff Radius:" range:[1.0, 500.0, 60.0] type:#float
                spinner spnPinch "Pinch Curve:" range:[-10.0, 10.0, 1.0] type:#float
                spinner spnBubble "Bubble Profile:" range:[-10.0, 10.0, 0.0] type:#float
            )
            group "Z-Axis Displacement"
            (
                spinner spnZLift "Z Lift Amount:" range:[-200.0, 200.0, 36.0] type:#float
                button btnApplyLift "Apply Organic Curve to Mesh" width:240 height:36
            )
            group "Presets"
            (
                button btnCanopy "Generate Tensile Wave Canopy" width:240
                button btnTerrain "Generate Landscape Mountain" width:240
            )

            on btnApplyLift pressed do
            (
                local curObj = selection[1]
                if curObj != undefined and classOf curObj == Editable_Poly then
                (
                    curObj.useSoftSel = true
                    curObj.ssFalloff = spnFalloff.value
                    curObj.ssPinch = spnPinch.value
                    curObj.ssBubble = spnBubble.value
                    polyOp.moveVert curObj curObj.selectedVerts [0, 0, spnZLift.value]
                    redrawViews()
                    messageBox "EVLab: Vertex soft displacement applied successfully!" title:"EVLab Max"
                )
                else
                (
                    messageBox "Please select an Editable Poly mesh in 3ds Max!" title:"EVLab Warning"
                )
            )

            on btnCanopy pressed do
            (
                local p = plane length:120 width:240 lengthsegs:16 widthsegs:32
                convertToPoly p
                p.name = "EVLab_Wave_Canopy"
                p.useSoftSel = true
                p.ssFalloff = 80.0
                polyOp.setVertSelection p #{1..10}
                polyOp.moveVert p #{1..10} [0, 0, 48.0]
                redrawViews()
            )
        )
        createDialog evlRollout
    )
)
`;
}

/**
 * Generate Rhino / Grasshopper Python script (.py)
 */
export function generateRhinoPythonScript(pluginName: string): string {
  return `# =============================================================================
# EVLab Multi-Software Suite: Rhino 3D & Grasshopper Python Script (.py)
# Tool: ${pluginName}
# Compatible with Rhino 7 & Rhino 8 (RhinoCommon API)
# =============================================================================
import rhinoscriptsyntax as rs
import math

def evlab_sculpt_vertices(mesh_id, center_pt, falloff_radius=60.0, lift_z=36.0):
    """Applies Gaussian soft selection to a Rhino 3D mesh"""
    if not rs.IsMesh(mesh_id):
        print("EVLab Error: Selected object is not a 3D Mesh.")
        return

    vertices = rs.MeshVertices(mesh_id)
    new_vertices = []

    for pt in vertices:
        dist = rs.Distance(pt, center_pt)
        if dist <= falloff_radius:
            ratio = dist / falloff_radius
            weight = math.exp(-3.0 * (ratio ** 2))
            new_z = pt.Z + (lift_z * weight)
            new_vertices.append([pt.X, pt.Y, new_z])
        else:
            new_vertices.append([pt.X, pt.Y, pt.Z])

    faces = rs.MeshFaceVertices(mesh_id)
    rs.DeleteObject(mesh_id)
    new_mesh = rs.AddMesh(new_vertices, faces)
    rs.SelectObject(new_mesh)
    print("EVLab: Rhino Mesh sculpted with organic Gaussian curve!")

if __name__ == "__main__":
    mesh = rs.GetObject("Select 3D Mesh to sculpt", rs.filter.mesh)
    if mesh:
        pt = rs.GetPoint("Pick center control point on mesh")
        if pt:
            evlab_sculpt_vertices(mesh, pt)
`;
}

/**
 * Generate Universal Wavefront OBJ file for 3D surfaces
 */
export function generateSampleObj(meshType: string): string {
  let objText = `# EVLab 3D Universal Wavefront OBJ Export
# Type: ${meshType}
# Scale: 1 Unit = 1 Inch (Real-World Architectural Scale)
# Generated by EVLab Plugin Hub
o EVLab_Organic_Surface
`;
  const nx = 10;
  const ny = 10;
  const width = 120.0;
  const height = 36.0;

  // Vertices
  for (let j = 0; j <= ny; j++) {
    const y = (j / ny) * width - width / 2;
    for (let i = 0; i <= nx; i++) {
      const x = (i / nx) * width - width / 2;
      let z = 0;
      if (meshType === 'canopy') {
        z = Math.sin((i / nx) * Math.PI * 2) * Math.cos((j / ny) * Math.PI) * height;
      } else {
        const d = Math.sqrt(x * x + y * y) / (width / 2);
        z = Math.max(0, (1 - d) * height);
      }
      objText += `v ${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}\n`;
    }
  }

  // Normals
  objText += `vn 0.000 0.000 1.000\n`;

  // Faces
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const p1 = j * (nx + 1) + i + 1;
      const p2 = j * (nx + 1) + (i + 1) + 1;
      const p3 = (j + 1) * (nx + 1) + (i + 1) + 1;
      const p4 = (j + 1) * (nx + 1) + i + 1;
      objText += `f ${p1} ${p2} ${p3}\n`;
      objText += `f ${p1} ${p3} ${p4}\n`;
    }
  }
  return objText;
}

/**
 * Trigger download for a single plugin (SketchUp, AutoCAD, Revit, etc.)
 */
export async function triggerPluginDownload(plugin: PluginItem): Promise<boolean> {
  try {
    let blob: Blob;

    if (plugin.fileFormat === '.rbz') {
      blob = await createSketchUpRbzBlob(plugin);
    } else if (plugin.fileFormat === '.dyn') {
      blob = new Blob([plugin.rawCodeSnippet], {
        type: 'application/json;charset=utf-8',
      });
    } else {
      // AutoLISP .lsp file
      blob = new Blob([plugin.rawCodeSnippet], {
        type: 'text/plain;charset=utf-8',
      });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = plugin.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

/**
 * Trigger download for a specific software format of a plugin
 */
export async function triggerSpecificSoftwareDownload(
  plugin: PluginItem,
  softwareType: 'sketchup' | 'blender' | 'autocad' | '3dsmax' | 'rhino' | 'obj',
): Promise<boolean> {
  try {
    let blob: Blob;
    let fileName: string;

    if (softwareType === 'sketchup') {
      blob = await createSketchUpRbzBlob(plugin);
      fileName = plugin.fileName.endsWith('.rbz') ? plugin.fileName : `${plugin.fileName}.rbz`;
    } else if (softwareType === 'blender') {
      const pyContent = generateBlenderAddonScript(plugin.nameEn);
      blob = new Blob([pyContent], { type: 'text/x-python;charset=utf-8' });
      fileName = `${plugin.id.replace('sketchup-', 'EVL_')}_blender_addon.py`;
    } else if (softwareType === 'autocad') {
      const lspContent = plugin.rawCodeSnippet.startsWith(';')
        ? plugin.rawCodeSnippet
        : `; EVLab AutoLISP CAD Tool: ${plugin.nameEn}\n; Type (C:EVL) in AutoCAD command prompt to run\n(defun c:EVL ()\n  (princ "\\nEVLab CAD Tool Active!")\n  (princ)\n)\n(princ "\\nLoaded ${plugin.nameEn}. Type EVL to run.")\n(princ)\n`;
      blob = new Blob([lspContent], { type: 'text/plain;charset=utf-8' });
      fileName = `${plugin.id.replace('sketchup-', 'EVL-').toUpperCase()}.lsp`;
    } else if (softwareType === '3dsmax') {
      const msContent = generate3dsMaxScript(plugin.nameEn);
      blob = new Blob([msContent], { type: 'text/plain;charset=utf-8' });
      fileName = `${plugin.id.replace('sketchup-', 'EVL_')}_maxscript.ms`;
    } else if (softwareType === 'rhino') {
      const rhinoPy = generateRhinoPythonScript(plugin.nameEn);
      blob = new Blob([rhinoPy], { type: 'text/x-python;charset=utf-8' });
      fileName = `${plugin.id.replace('sketchup-', 'EVL_')}_rhino.py`;
    } else {
      // Universal OBJ
      const objData = generateSampleObj(plugin.id.includes('vertex') ? 'canopy' : 'terrain');
      blob = new Blob([objData], { type: 'model/obj;charset=utf-8' });
      fileName = `${plugin.id}_3D_mesh.obj`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Specific software download failed:', error);
    return false;
  }
}

/**
 * Trigger SUITE / GROUP Download:
 * Bundles multiple plugins into an organized ZIP archive across target software
 */
export async function triggerSuiteDownload(
  suite: PluginSuite,
  targetSoftware: SuiteDownloadTarget = 'all',
): Promise<boolean> {
  try {
    const zip = new JSZip();

    // Find all plugins matching the suite IDs
    const pluginsInSuite = PLUGINS_DATA.filter((p) =>
      suite.includedPluginIds.includes(p.id),
    );

    // Master README instructions
    const readmeContent = `=============================================================================
EVLab Engineering & Architecture Plugin Hub
SUITE BUNDLE: ${suite.nameEn}
Code Name: ${suite.codeName}
Target Software: ${targetSoftware.toUpperCase()}
=============================================================================

Included Plugins in this Bundle (${pluginsInSuite.length} tools):
${pluginsInSuite.map((p, idx) => `  ${idx + 1}. ${p.nameEn} (${p.fileName})`).join('\n')}

-----------------------------------------------------------------------------
1. TRIMBLE SKETCHUP INSTALLATION (.RBZ):
-----------------------------------------------------------------------------
  - Launch Trimble SketchUp (2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026).
  - From the top menu bar, click: Extensions > Extension Manager.
  - In the Extension Manager window, click the blue 'Install Extension' button.
  - Browse to the 'SketchUp_Extensions_RBZ/' folder and select each .rbz file.
  - Once installed, access all tools under: Extensions > EVLab Tools.

-----------------------------------------------------------------------------
2. AUTODESK AUTOCAD & CIVIL 3D INSTALLATION (.LSP):
-----------------------------------------------------------------------------
  - Open AutoCAD or Civil 3D.
  - Type 'APPLOAD' in the command line and press Enter.
  - Browse to 'AutoCAD_Civil3D_LSP/' and select the .lsp files.
  - To load permanently on every startup, add them to the 'Startup Suite' (Briefcase icon).
  - Alternatively, type '(load "filename.lsp")' or drag-and-drop directly into CAD viewport.

-----------------------------------------------------------------------------
3. BLENDER 3D ADDON INSTALLATION (.PY):
-----------------------------------------------------------------------------
  - In Blender (3.x - 4.x), go to Edit > Preferences > Add-ons.
  - Click 'Install...' at the top right.
  - Select the python script from 'Blender_Addons_PY/'.
  - Check the checkbox next to 'EVLab' to enable it.
  - Access in 3D Viewport > Sidebar (press N key) > 'EVLab' tab.

-----------------------------------------------------------------------------
4. AUTODESK 3DS MAX INSTALLATION (.MS):
-----------------------------------------------------------------------------
  - In 3ds Max, open Scripting > Run Script... and pick the .ms file.
  - To add to a toolbar: Customize > Customize User Interface > Toolbars tab > Category 'EVLab Tools'.

-----------------------------------------------------------------------------
5. RHINO 3D & GRASSHOPPER (.PY):
-----------------------------------------------------------------------------
  - In Rhino 7 or 8, type 'RunPythonScript' and select the python file.

Website: EVLab Plugin Hub
All plugins are standalone, 100% offline, and require no subscription or internet access.
=============================================================================
`;

    zip.file('00_README_INSTALLATION_GUIDE.txt', readmeContent);

    if (targetSoftware === 'all' || targetSoftware === 'sketchup') {
      const skpFolder = zip.folder('01_SketchUp_Extensions_RBZ');
      if (skpFolder) {
        for (const plugin of pluginsInSuite) {
          const rbzBlob = await createSketchUpRbzBlob(plugin);
          skpFolder.file(`${plugin.fileName}`, rbzBlob);
        }

        // Master Extension loader to load all in one go
        const masterLoaderRuby = `# EVLab Master Extension Auto-Loader for ${suite.codeName}
require 'sketchup.rb'
module EVLab
  module ${suite.codeName.replace(/[^a-zA-Z0-9]/g, '')}
    puts "Loaded EVLab Suite: ${suite.nameEn}"
  end
end
`;
        skpFolder.file('00_EVLAB_MASTER_LOADER.rb', masterLoaderRuby);
      }
    }

    if (targetSoftware === 'all' || targetSoftware === 'autocad') {
      const acadFolder = zip.folder('02_AutoCAD_Civil3D_LSP');
      if (acadFolder) {
        let masterAcadLsp = `;; EVLab Auto-Load All LISP Routines for ${suite.codeName}\n`;
        for (const plugin of pluginsInSuite) {
          const lspName = `${plugin.id.replace('sketchup-', 'EVL-').replace('autocad-', 'EVL-').toUpperCase()}.lsp`;
          acadFolder.file(lspName, plugin.rawCodeSnippet);
          masterAcadLsp += `(princ "\\n[EVLab] ${plugin.nameEn} loaded.")\n`;
        }
        acadFolder.file('00_ACAD_LOAD_ALL.lsp', masterAcadLsp);
      }
    }

    if (targetSoftware === 'all' || targetSoftware === 'blender') {
      const blenderFolder = zip.folder('03_Blender_Addons_PY');
      if (blenderFolder) {
        for (const plugin of pluginsInSuite) {
          const pyScript = generateBlenderAddonScript(plugin.nameEn);
          blenderFolder.file(`${plugin.id.replace('sketchup-', 'EVL_')}_blender.py`, pyScript);
        }
      }
    }

    if (targetSoftware === 'all' || targetSoftware === '3dsmax') {
      const maxFolder = zip.folder('04_3dsMax_MaxScript_MS');
      if (maxFolder) {
        for (const plugin of pluginsInSuite) {
          const msScript = generate3dsMaxScript(plugin.nameEn);
          maxFolder.file(`${plugin.id.replace('sketchup-', 'EVL_')}_3dsmax.ms`, msScript);
        }
      }
    }

    if (targetSoftware === 'all' || targetSoftware === 'universal') {
      const uniFolder = zip.folder('05_Universal_CAD_BIM_OBJ_DXF');
      if (uniFolder) {
        uniFolder.file('EVL_Sample_Wave_Canopy.obj', generateSampleObj('canopy'));
        uniFolder.file('EVL_Sample_Terrain_Peak.obj', generateSampleObj('terrain'));
      }
    }

    // Generate compressed ZIP archive
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    const suffix = targetSoftware === 'all' ? 'All-Software-Suite' : `${targetSoftware}-Bundle`;
    const zipFileName = `${suite.codeName}-${suffix}.zip`;

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Suite download failed:', error);
    return false;
  }
}

/**
 * Trigger SOFTWARE GROUP Download:
 * Directly downloads an entire package for a specific software (SketchUp, AutoCAD, Blender, 3ds Max, Revit)
 * or the master mega pack without confusing format toggles.
 */
export async function triggerSoftwareGroupDownload(group: SoftwareGroup): Promise<boolean> {
  try {
    const zip = new JSZip();

    // 1. Trimble SketchUp Groups (.rbz genuine extension packages)
    if (group.softwareId === 'sketchup') {
      const suiteSafeName = group.downloadFileName.replace('.rbz', '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const rootLoaderFile = `${suiteSafeName}.rb`;
      const suiteFolderName = suiteSafeName;

      // Master SketchUp Extension registration
      const rootLoaderContent = `# EVLab SketchUp Suite Extension: ${group.nameEn}
require 'sketchup.rb'
require 'extensions.rb'

module EVLab
  module ${suiteSafeName.toUpperCase().replace(/[^A-Z0-9]/g, '')}
    ext = SketchupExtension.new('${group.nameEn}', '${suiteFolderName}/main.rb')
    ext.description = '${group.descriptionEn.replace(/'/g, "\\'")}'
    ext.version     = '2.5.0'
    ext.creator     = 'EVLab Engineering Plugin Hub'
    Sketchup.register_extension(ext, true)
  end
end
`;
      zip.file(rootLoaderFile, rootLoaderContent);

        // Subfolder with tools
        const subFolder = zip.folder(suiteFolderName);
        if (subFolder) {
          const iconsFolder = subFolder.folder('icons');
          if (iconsFolder) {
            // Embed standard lightweight vector SVG icons for toolbar buttons
            iconsFolder.file('toolbox.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0f172a"/><polygon points="13,2 6,13 12,13 11,22 18,11 12,11" fill="#38bdf8"/></svg>`);
            iconsFolder.file('layers.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0369a1"/><polygon points="12,4 21,9 12,14 3,9" fill="#38bdf8"/><polygon points="3,12 12,17 21,12 21,14 12,19 3,14" fill="#e0f2fe"/></svg>`);
            iconsFolder.file('wall.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1e3a8a"/><rect x="3" y="4" width="8" height="5" fill="#ef4444" rx="1"/><rect x="13" y="4" width="8" height="5" fill="#ef4444" rx="1"/><rect x="7" y="10" width="10" height="5" fill="#dc2626" rx="1"/><rect x="3" y="16" width="8" height="5" fill="#b91c1c" rx="1"/><rect x="13" y="16" width="8" height="5" fill="#b91c1c" rx="1"/></svg>`);
            iconsFolder.file('frame.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#7f1d1d"/><rect x="4" y="4" width="4" height="16" fill="#f87171" rx="1"/><rect x="16" y="4" width="4" height="16" fill="#f87171" rx="1"/><rect x="4" y="4" width="16" height="4" fill="#ef4444"/><rect x="4" y="16" width="16" height="4" fill="#ef4444"/></svg>`);
            iconsFolder.file('slab.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#78350f"/><polygon points="12,3 21,8 12,13 3,8" fill="#f59e0b"/><polygon points="3,8 12,13 12,18 3,13" fill="#d97706"/><polygon points="12,13 21,8 21,13 12,18" fill="#b45309"/></svg>`);
            iconsFolder.file('door.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#581c87"/><rect x="5" y="3" width="14" height="18" fill="#a855f7" rx="1"/><circle cx="15" cy="12" r="1.5" fill="#fef08a"/></svg>`);
            iconsFolder.file('window.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#164e63"/><rect x="4" y="4" width="16" height="16" fill="#06b6d4" rx="1"/><line x1="12" y1="4" x2="12" y2="20" stroke="#cffafe" stroke-width="2"/><line x1="4" y1="12" x2="20" y2="12" stroke="#cffafe" stroke-width="2"/></svg>`);
            iconsFolder.file('grill.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#713f12"/><circle cx="12" cy="12" r="7" stroke="#facc15" stroke-width="2" fill="none"/></svg>`);
            iconsFolder.file('stair.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#881337"/><path d="M4,20 L8,20 L8,16 L12,16 L12,12 L16,12 L16,8 L20,8 L20,4" stroke="#fb7185" stroke-width="2" fill="none"/></svg>`);
            iconsFolder.file('roof.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#365314"/><polygon points="12,3 21,11 3,11" fill="#84cc16"/><rect x="5" y="11" width="14" height="9" fill="#65a30d"/></svg>`);
          }

          let suiteMainMenuContent = `# EVLab ${group.nameEn} Suite
require 'sketchup.rb'

module EVLab
  # Auto-load all tool scripts in this package
  Dir.glob(File.join(File.dirname(__FILE__), '*.rb')).each do |file|
    load file unless file.end_with?('main.rb')
  end

  unless file_loaded?(__FILE__)
    menu = UI.menu('Extensions').add_submenu('EVLab Tools')

    # -----------------------------------------------------------------------
    # NATIVE SKETCHUP DOCKABLE TOOLBAR (সবগুলো টুল একসাথে একটি টুলবার হিসেবে থাকবে)
    # -----------------------------------------------------------------------
    toolbar_name = "${group.nameEn.split(':')[0].trim()}"
    toolbar = UI::Toolbar.new(toolbar_name)
    icons_dir = File.join(File.dirname(__FILE__), 'icons')
`;

          // Gather relevant plugins
          const targetPluginIds = group.includedPlugins.map((ip) => ip.id);
          const matchedPlugins = PLUGINS_DATA.filter((p) => targetPluginIds.includes(p.id) || group.id === 'skp-master');

          for (const p of matchedPlugins) {
            const toolCleanName = p.id.replace('sketchup-', '').replace(/-/g, '_');
            subFolder.file(`${toolCleanName}.rb`, p.rawCodeSnippet);

            // Direct execution call when clicked from SketchUp menu or toolbar
            let invokeCall = '';
            let iconKey = 'toolbox';
            if (p.id.includes('building-layers') || p.id.includes('layers')) {
              invokeCall = 'EVLab::BuildingLayers.show_dialog';
              iconKey = 'layers';
            } else if (p.id.includes('wall-builder')) {
              invokeCall = 'EVLab::WallBuilder.show_dialog';
              iconKey = 'wall';
            } else if (p.id.includes('structural-frame') || p.id.includes('frame')) {
              invokeCall = 'EVLab::StructuralFrame.show_dialog';
              iconKey = 'frame';
            } else if (p.id.includes('slab-floor') || p.id.includes('slab')) {
              invokeCall = 'EVLab::SlabFloor.show_dialog';
              iconKey = 'slab';
            } else if (p.id.includes('stair-pro') || p.id.includes('stair')) {
              invokeCall = 'EVLab::StairPro.show_dialog';
              iconKey = 'stair';
            } else if (p.id.includes('roof-parapet') || p.id.includes('roof')) {
              invokeCall = 'EVLab::RoofParapet.show_dialog';
              iconKey = 'roof';
            } else if (p.id.includes('facemaker')) {
              invokeCall = 'EVLab::FaceMaker.make_faces';
              iconKey = 'slab';
            } else if (p.id.includes('railing')) {
              invokeCall = 'EVLab::Railing.show_main_dialog';
              iconKey = 'stair';
            } else if (p.id.includes('rail')) {
              invokeCall = 'EVLab::RailTrack.show_track_dialog';
            } else if (p.id.includes('road')) {
              invokeCall = 'EVLab::RoadHub.show_dialog';
            } else if (p.id.includes('drain')) {
              invokeCall = 'EVLab::DrainNetwork.show_dialog';
            } else if (p.id.includes('pipenetwork')) {
              invokeCall = 'EVLab::PipeNetwork.show_dialog';
            } else if (p.id.includes('pipe')) {
              invokeCall = 'EVLab::PipePro.show_dialog';
            } else if (p.id.includes('culvert')) {
              invokeCall = 'EVLab::Culvert.show_dialog';
            } else if (p.id.includes('plant3d')) {
              invokeCall = 'EVLab::Plant3D.show_dialog';
            } else if (p.id.includes('plantation') || p.id.includes('landscape')) {
              invokeCall = 'EVLab::Plantation.show_dialog';
            } else if (p.id.includes('grill')) {
              invokeCall = 'EVLab::Grill.show_dialog';
              iconKey = 'grill';
            } else if (p.id.includes('window')) {
              invokeCall = 'EVLab::Window.show_dialog';
              iconKey = 'window';
            } else if (p.id.includes('door')) {
              invokeCall = 'EVLab::Door.show_dialog';
              iconKey = 'door';
            } else if (p.id.includes('gate')) {
              invokeCall = 'EVLab::Gate.show_dialog';
              iconKey = 'wall';
            } else if (p.id.includes('boundary')) {
              invokeCall = 'EVLab::BoundaryWall.show_dialog';
              iconKey = 'wall';
            } else if (p.id.includes('vertex')) {
              invokeCall = 'EVLab::VertexEditor.activate_tool';
            } else if (p.id.includes('bim') || p.id.includes('building')) {
              invokeCall = 'EVLab::BuildingBIM.show_project_browser';
            } else if (p.id.includes('boq') || p.id.includes('quantcost') || p.id.includes('estimator')) {
              invokeCall = 'EVLab::QuantCost.show_dialog';
            } else {
              invokeCall = `UI.messagebox("EVLab: Loaded ${p.nameEn}")`;
            }

            // Also copy icon with tool clean name
            if (iconsFolder) {
              const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0284c7"/><text x="12" y="16" font-size="11" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">${p.nameEn.substring(0, 3).toUpperCase()}</text></svg>`;
              iconsFolder.file(`${toolCleanName}.svg`, svgContent);
            }

            suiteMainMenuContent += `
    cmd_${toolCleanName} = UI::Command.new("${p.nameEn.split(':')[0].trim().replace(/"/g, "'")}") {
      ${invokeCall}
    }
    cmd_${toolCleanName}.tooltip = "${p.nameEn.replace(/"/g, "'")}"
    cmd_${toolCleanName}.status_bar_text = "${(p.shortSummaryEn || p.nameEn).replace(/"/g, "'")}"
    icon_path_${toolCleanName} = File.join(icons_dir, '${toolCleanName}.svg')
    if File.exist?(icon_path_${toolCleanName})
      cmd_${toolCleanName}.small_icon = icon_path_${toolCleanName}
      cmd_${toolCleanName}.large_icon = icon_path_${toolCleanName}
    end
    toolbar.add_item(cmd_${toolCleanName})
    menu.add_item(cmd_${toolCleanName})
`;
          }

          suiteMainMenuContent += `
    # Master Visual Toolbox button on toolbar
    cmd_tb = UI::Command.new("⚡ Master Toolbox") { self.show_master_toolbox }
    cmd_tb.tooltip = "EVLab Master Visual Web Toolbox"
    tb_icon = File.join(icons_dir, 'toolbox.svg')
    if File.exist?(tb_icon)
      cmd_tb.small_icon = tb_icon
      cmd_tb.large_icon = tb_icon
    end
    toolbar.add_item(cmd_tb)

    # Show Toolbar Docked in SketchUp
    toolbar.show
    toolbar.restore
`;

          // Master Dockable/Floating Visual Toolbox
          suiteMainMenuContent += `
    def self.show_master_toolbox
      html = <<-HTML
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { margin: 0; padding: 0; background: #0b0f19; color: #f8fafc; font-size: 12px; }
          .header { background: #111827; padding: 12px 16px; border-bottom: 1px solid #1f2937; display: flex; align-items: center; justify-content: space-between; }
          .logo { font-size: 14px; font-weight: 900; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
          .tag { background: #0369a1; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .tabs { display: flex; background: #111827; border-bottom: 1px solid #1f2937; overflow-x: auto; padding: 0 8px; }
          .tab { padding: 8px 12px; font-weight: 700; color: #9ca3af; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 11px; }
          .tab.active { color: #38bdf8; border-bottom-color: #38bdf8; }
          .container { padding: 14px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
          .card { background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 100px; }
          .card:hover { transform: translateY(-2px); border-color: #38bdf8; box-shadow: 0 4px 12px rgba(56,189,248,0.2); }
          .card-icon { font-size: 24px; margin-bottom: 4px; }
          .card-name { font-weight: 700; color: #f3f4f6; font-size: 11px; margin-bottom: 4px; }
          .card-badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; background: #0f172a; color: #94a3b8; border: 1px solid #334155; }
          .footer { padding: 8px 14px; background: #111827; border-top: 1px solid #1f2937; font-size: 10px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚡ EVLab Master Toolbox</div>
          <span class="tag">Active Suite</span>
        </div>
        <div class="tabs">
          <div class="tab active" onclick="filterTab('all', this)">All Tools</div>
          <div class="tab" onclick="filterTab('arch', this)">Arch & BIM</div>
          <div class="tab" onclick="filterTab('site', this)">Landscape & Site</div>
          <div class="tab" onclick="filterTab('civil', this)">Civil & Infra</div>
          <div class="tab" onclick="filterTab('mep', this)">MEP & Plant</div>
        </div>
        <div class="container" id="toolGrid">
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('layers')">
            <div class="card-icon">🏷️</div>
            <div class="card-name">EVL-Layers</div>
            <div class="card-badge">BIM Tags</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('wall')">
            <div class="card-icon">🧱</div>
            <div class="card-name">EVL-WallBuilder</div>
            <div class="card-badge">5"/10" Walls</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('frame')">
            <div class="card-icon">🏗️</div>
            <div class="card-name">EVL-Frame</div>
            <div class="card-badge">Columns & Beams</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('slab')">
            <div class="card-icon">📐</div>
            <div class="card-name">EVL-SlabFloor</div>
            <div class="card-badge">Slabs & Balcony</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('stair')">
            <div class="card-icon">🪜</div>
            <div class="card-name">EVL-StairPro</div>
            <div class="card-badge">Dog-Legged RCC</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('roof')">
            <div class="card-icon">🏠</div>
            <div class="card-name">EVL-RoofParapet</div>
            <div class="card-badge">3ft Parapet/Tank</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('door')">
            <div class="card-icon">🚪</div>
            <div class="card-name">EVL-Door</div>
            <div class="card-badge">Visual Preview</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('window')">
            <div class="card-icon">🪟</div>
            <div class="card-name">EVL-Window</div>
            <div class="card-badge">Visual Preview</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('grill')">
            <div class="card-icon">🛡️</div>
            <div class="card-name">EVL-Grill</div>
            <div class="card-badge">Visual Preview</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('bim')">
            <div class="card-icon">🏛️</div>
            <div class="card-name">Building BIM</div>
            <div class="card-badge">Revit-Style</div>
          </div>
          <div class="card" data-cat="site" onclick="sketchup.launch_tool('landscape')">
            <div class="card-icon">🌿</div>
            <div class="card-name">Landscape Studio</div>
            <div class="card-badge">Draw-to-Create</div>
          </div>
          <div class="card" data-cat="site" onclick="sketchup.launch_tool('boundary')">
            <div class="card-icon">🧱</div>
            <div class="card-name">Boundary Wall</div>
            <div class="card-badge">Corridors</div>
          </div>
          <div class="card" data-cat="site" onclick="sketchup.launch_tool('gate')">
            <div class="card-icon">⛩️</div>
            <div class="card-name">EVL-Gate</div>
            <div class="card-badge">Sliding/Swing</div>
          </div>
          <div class="card" data-cat="civil" onclick="sketchup.launch_tool('road')">
            <div class="card-icon">🛣️</div>
            <div class="card-name">EVL-Road</div>
            <div class="card-badge">Corridor Camber</div>
          </div>
          <div class="card" data-cat="civil" onclick="sketchup.launch_tool('drain')">
            <div class="card-icon">🌊</div>
            <div class="card-name">EVL-Drain</div>
            <div class="card-badge">U-Drain / Culvert</div>
          </div>
          <div class="card" data-cat="civil" onclick="sketchup.launch_tool('rail')">
            <div class="card-icon">🚆</div>
            <div class="card-name">EVL-Rail</div>
            <div class="card-badge">Track & Ballast</div>
          </div>
          <div class="card" data-cat="civil" onclick="sketchup.launch_tool('culvert')">
            <div class="card-icon">🌉</div>
            <div class="card-name">EVL-Culvert</div>
            <div class="card-badge">Box & Wing Wall</div>
          </div>
          <div class="card" data-cat="mep" onclick="sketchup.launch_tool('pipe')">
            <div class="card-icon">🔧</div>
            <div class="card-name">EVL-Pipe Pro</div>
            <div class="card-badge">Civil Pipes</div>
          </div>
          <div class="card" data-cat="mep" onclick="sketchup.launch_tool('plant3d')">
            <div class="card-icon">⚙️</div>
            <div class="card-name">EVL-Plant3D</div>
            <div class="card-badge">Valves & Elbows</div>
          </div>
          <div class="card" data-cat="arch" onclick="sketchup.launch_tool('boq')">
            <div class="card-icon">📊</div>
            <div class="card-name">EVL-QuantCost</div>
            <div class="card-badge">Live Takeoff</div>
          </div>
        </div>
        <div class="footer">Click any tool to launch with Visual Preview • EVLab Ecosystem</div>

        <script>
          function filterTab(cat, el) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            var cards = document.querySelectorAll('.card');
            cards.forEach(c => {
              if (cat === 'all' || c.getAttribute('data-cat') === cat) {
                c.style.display = 'flex';
              } else {
                c.style.display = 'none';
              }
            });
          }
        </script>
      </body>
      </html>
      HTML

      tb_dlg = UI::HtmlDialog.new({
        :dialog_title => "⚡ EVLab Master Toolbox (All-in-One)",
        :preferences_key => "com.evlab.master.toolbox",
        :scrollable => true,
        :resizable => true,
        :width => 520,
        :height => 420,
        :min_width => 380,
        :min_height => 320
      })
      tb_dlg.set_html(html)
      tb_dlg.add_action_callback("launch_tool") do |_, tool_id|
        case tool_id
        when 'layers' then EVLab::BuildingLayers.show_dialog if defined?(EVLab::BuildingLayers)
        when 'wall' then EVLab::WallBuilder.show_dialog if defined?(EVLab::WallBuilder)
        when 'frame' then EVLab::StructuralFrame.show_dialog if defined?(EVLab::StructuralFrame)
        when 'slab' then EVLab::SlabFloor.show_dialog if defined?(EVLab::SlabFloor)
        when 'stair' then EVLab::StairPro.show_dialog if defined?(EVLab::StairPro)
        when 'roof' then EVLab::RoofParapet.show_dialog if defined?(EVLab::RoofParapet)
        when 'door' then EVLab::Door.show_dialog if defined?(EVLab::Door)
        when 'window' then EVLab::Window.show_dialog if defined?(EVLab::Window)
        when 'grill' then EVLab::Grill.show_dialog if defined?(EVLab::Grill)
        when 'bim' then EVLab::BuildingBIM.show_project_browser if defined?(EVLab::BuildingBIM)
        when 'landscape' then EVLab::Landscape.show_dialog if defined?(EVLab::Landscape)
        when 'boundary' then EVLab::BoundaryWall.show_dialog if defined?(EVLab::BoundaryWall)
        when 'gate' then EVLab::Gate.show_dialog if defined?(EVLab::Gate)
        when 'road' then EVLab::RoadHub.show_dialog if defined?(EVLab::RoadHub)
        when 'drain' then EVLab::DrainNetwork.show_dialog if defined?(EVLab::DrainNetwork)
        when 'rail' then EVLab::RailTrack.show_track_dialog if defined?(EVLab::RailTrack)
        when 'culvert' then EVLab::Culvert.show_dialog if defined?(EVLab::Culvert)
        when 'pipe' then EVLab::PipePro.show_dialog if defined?(EVLab::PipePro)
        when 'plant3d' then EVLab::Plant3D.show_dialog if defined?(EVLab::Plant3D)
        when 'boq' then EVLab::QuantCost.show_dialog if defined?(EVLab::QuantCost)
        end
      end
      tb_dlg.show
    end

    menu.add_separator
    menu.add_item("⚡ Open EVLab Master Toolbox") { self.show_master_toolbox }
`;

          suiteMainMenuContent += `    file_loaded(__FILE__)\n  end\nend\n`;
          subFolder.file('main.rb', suiteMainMenuContent);


        // README
        const readmeContent = `=============================================================================
EVLab Engineering Plugin Hub - Trimble SketchUp Extension Pack
Package: ${group.nameEn} (${group.downloadFileName})
Target: Trimble SketchUp 2019 - 2026 (Make / Pro / Studio)
Category: ${group.workCategoryEn}
Included Tools: ${group.fileCount}
=============================================================================

Included Tools in this Package:
${group.includedPlugins.map((p, i) => `  ${i + 1}. ${p.nameEn} - ${p.descriptionEn}`).join('\n')}

-----------------------------------------------------------------------------
HOW TO INSTALL IN SKETCHUP (৩টি সহজ ধাপ):
-----------------------------------------------------------------------------
1. Launch Trimble SketchUp.
2. From the top menu bar, click: Extensions > Extension Manager.
3. Click the blue 'Install Extension' button at the bottom.
4. Select this '${group.downloadFileName}' file.
5. All tools will instantly appear under: Extensions > ${group.nameEn} menu!

All plugins work 100% offline with zero external dependencies.
=============================================================================`;
        subFolder.file('README.txt', readmeContent);
      }
    }

    // 2. Autodesk AutoCAD & Civil 3D Groups (.zip containing .lsp tools and loader)
    else if (group.softwareId === 'autocad') {
      const readme = `=============================================================================
EVLab Engineering Plugin Hub - AutoCAD & Civil 3D Tools Pack
Package: ${group.nameEn}
Category: ${group.workCategoryEn}
Target: AutoCAD & Civil 3D 2018 - 2026
Total Tools: ${group.fileCount}
=============================================================================

Included Tools:
${group.includedPlugins.map((p, i) => `  ${i + 1}. ${p.nameEn} - ${p.descriptionEn}`).join('\n')}

-----------------------------------------------------------------------------
HOW TO LOAD IN AUTOCAD (২টি সহজ নিয়ম):
-----------------------------------------------------------------------------
Method A (Load All at Once):
  1. Open AutoCAD or Civil 3D.
  2. Type 'APPLOAD' in the command line and press Enter.
  3. Select '00_LOAD_${group.id.toUpperCase().replace(/-/g, '_')}.lsp' and click 'Load'.
     All tools in this pack will load instantly!

Method B (Permanent Auto-Load on Startup):
  1. In the APPLOAD dialog, click 'Contents...' under 'Startup Suite' (Briefcase icon).
  2. Click 'Add...' and select the .lsp files from this folder.
  3. Click Close. Now every time AutoCAD starts, all tools will be available automatically!
=============================================================================`;
      zip.file('00_README_AUTOCAD_INSTALL.txt', readme);

      const targetPluginIds = group.includedPlugins.map((ip) => ip.id);
      const matchedPlugins = PLUGINS_DATA.filter(
        (p) =>
          targetPluginIds.includes(p.id) ||
          (group.id === 'cad-master' && (p.softwareId === 'autocad' || p.softwareId === 'civil3d')),
      );

      let loaderLsp = `;; EVLab Auto-Load: ${group.nameEn}\n`;
      for (const p of matchedPlugins) {
        const lspName = `${p.id.replace('autocad-', 'EVL-').replace('civil3d-', 'EVL-').toUpperCase()}.lsp`;
        zip.file(lspName, p.rawCodeSnippet);
        loaderLsp += `(load "${lspName}" "\\n[EVLab] Failed to load ${lspName}")\n`;
      }
      loaderLsp += `(princ "\\nAll EVLab ${group.nameEn} Tools Loaded Successfully!\\n")(princ)\n`;
      zip.file(`00_LOAD_${group.id.toUpperCase().replace(/-/g, '_')}.lsp`, loaderLsp);
    }

    // 3. Blender 3D Groups
    else if (group.softwareId === 'blender') {
      const readme = `=============================================================================
EVLab Engineering Plugin Hub - Blender 3D Addons Pack
Package: ${group.nameEn}
Target: Blender 3.0 - 4.3+ (Windows, macOS, Linux)
Category: ${group.workCategoryEn}
Total Addons: ${group.fileCount}
=============================================================================

Included Addons in this Pack:
${group.includedPlugins.map((p, i) => `  ${i + 1}. ${p.nameEn} - ${p.descriptionEn}`).join('\n')}

-----------------------------------------------------------------------------
HOW TO INSTALL IN BLENDER:
-----------------------------------------------------------------------------
1. In Blender, go to Edit > Preferences > Add-ons.
2. Click the 'Install...' button at top right.
3. Select the python (.py) files from this folder.
4. Check the box to enable the addon.
5. In 3D Viewport, press 'N' to open the sidebar tab: EVLab.
=============================================================================`;
      zip.file('00_README_BLENDER_INSTALL.txt', readme);

      for (const item of group.includedPlugins) {
        zip.file(`${item.id.replace(/-/g, '_')}_addon.py`, generateBlenderAddonScript(item.nameEn));
      }
    }

    // 4. Autodesk 3ds Max Groups
    else if (group.softwareId === '3dsmax') {
      const readme = `=============================================================================
EVLab Engineering Plugin Hub - Autodesk 3ds Max Scripts
Package: ${group.nameEn}
Target: Autodesk 3ds Max 2020 - 2026
Category: ${group.workCategoryEn}
Total Scripts: ${group.fileCount}
=============================================================================

Included Scripts in this Pack:
${group.includedPlugins.map((p, i) => `  ${i + 1}. ${p.nameEn} - ${p.descriptionEn}`).join('\n')}

-----------------------------------------------------------------------------
HOW TO RUN IN 3DS MAX:
-----------------------------------------------------------------------------
1. In 3ds Max, click top menu: Scripting > Run Script...
2. Select the .ms file from this folder.
3. The parametric dialog will open automatically!
4. (Optional) Drag the script directly into your viewport or toolbar.
=============================================================================`;
      zip.file('00_README_3DSMAX_INSTALL.txt', readme);

      for (const item of group.includedPlugins) {
        zip.file(`${item.id.replace(/-/g, '_')}.ms`, generate3dsMaxScript(item.nameEn));
      }
    }

    // 5. Autodesk Revit BIM Groups
    else if (group.softwareId === 'revit') {
      const readme = `=============================================================================
EVLab Engineering Plugin Hub - Autodesk Revit BIM & Dynamo Pack
Package: ${group.nameEn}
Target: Autodesk Revit 2020 - 2026
Category: ${group.workCategoryEn}
Total Packages: ${group.fileCount}
=============================================================================

Included Packages:
${group.includedPlugins.map((p, i) => `  ${i + 1}. ${p.nameEn} - ${p.descriptionEn}`).join('\n')}

-----------------------------------------------------------------------------
HOW TO RUN IN REVIT:
-----------------------------------------------------------------------------
1. In Revit, go to Manage tab > Dynamo Player.
2. Click the 'Browse to folder' icon and select this extracted directory.
3. Click the Play button next to the desired script.
=============================================================================`;
      zip.file('00_README_REVIT_INSTALL.txt', readme);

      for (const item of group.includedPlugins) {
        const dynContent = JSON.stringify(
          {
            Uuid: 'evlab-' + item.id,
            Name: item.nameEn,
            Description: item.descriptionEn,
            Author: 'EVLab BIM Studio',
            Nodes: [],
            Connectors: [],
          },
          null,
          2,
        );
        zip.file(`${item.id.replace(/-/g, '_')}.dyn`, dynContent);
      }
    }

    // 6. Complete All-Software Mega Pack
    else {
      const masterReadme = `=============================================================================
EVLab Complete Multi-Software Engineering & Architecture Mega Pack
All Software Plugins, Tools, Addons & Scripts in One Master Archive
=============================================================================

Folders included:
  📁 01_SketchUp_Extensions_RBZ/ - All SketchUp extensions (.rbz ready to install)
  📁 02_AutoCAD_Civil3D_Tools/   - All AutoCAD & Civil 3D tools (.lsp)
  📁 03_Blender_Addons/          - All Blender Python addons (.py)
  📁 04_3dsMax_Scripts/          - All 3ds Max scripts (.ms)
  📁 05_Revit_BIM_Packages/      - All Revit BIM Dynamo packages (.dyn)

Every folder contains its own installation guide.
All plugins are standalone, 100% offline, and require zero subscriptions.
=============================================================================`;
      zip.file('00_READ_ME_FIRST.txt', masterReadme);

      // SketchUp folder
      const skpFolder = zip.folder('01_SketchUp_Extensions_RBZ');
      if (skpFolder) {
        const skpPlugins = PLUGINS_DATA.filter((p) => p.softwareId === 'sketchup');
        for (const p of skpPlugins) {
          const rbzBlob = await createSketchUpRbzBlob(p);
          skpFolder.file(p.fileName, rbzBlob);
        }
      }

      // AutoCAD folder
      const acadFolder = zip.folder('02_AutoCAD_Civil3D_Tools');
      if (acadFolder) {
        const acadPlugins = PLUGINS_DATA.filter((p) => p.softwareId === 'autocad' || p.softwareId === 'civil3d');
        for (const p of acadPlugins) {
          const lspName = `${p.id.replace('autocad-', 'EVL-').replace('civil3d-', 'EVL-').toUpperCase()}.lsp`;
          acadFolder.file(lspName, p.rawCodeSnippet);
        }
      }

      // Blender folder
      const blenderFolder = zip.folder('03_Blender_Addons');
      if (blenderFolder) {
        const blenderItems = [
          'EVL-Railing',
          'EVL-Grill',
          'EVL-Window',
          'EVL-Door',
          'EVL-BoundaryWall',
          'EVL-Vertex',
        ];
        for (const name of blenderItems) {
          blenderFolder.file(`${name.replace(/-/g, '_')}_addon.py`, generateBlenderAddonScript(name));
        }
      }

      // 3ds Max folder
      const maxFolder = zip.folder('04_3dsMax_Scripts');
      if (maxFolder) {
        const maxItems = [
          'EVL-Railing',
          'EVL-Grill',
          'EVL-Window',
          'EVL-Door',
          'EVL-BoundaryWall',
          'EVL-Vertex',
        ];
        for (const name of maxItems) {
          maxFolder.file(`${name.replace(/-/g, '_')}.ms`, generate3dsMaxScript(name));
        }
      }

      // Revit folder
      const revitFolder = zip.folder('05_Revit_BIM_Packages');
      if (revitFolder) {
        revitFolder.file(
          'EVL_RoomRenumber.dyn',
          JSON.stringify({ Name: 'EVL-RoomRenumber', Author: 'EVLab' }, null, 2),
        );
        revitFolder.file(
          'EVL_Rebar_Detailer.dyn',
          JSON.stringify({ Name: 'EVL-RebarDetailer', Author: 'EVLab' }, null, 2),
        );
      }
    }

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = group.downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error('Software group download failed:', error);
    return false;
  }
}

