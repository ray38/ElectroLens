export function disposeMeshOrGroup(objectToDispose) {
    if (objectToDispose) {
        if (objectToDispose instanceof THREE.Group) {
            disposeGroup(objectToDispose);
        } else if (objectToDispose instanceof THREE.Mesh
            || objectToDispose instanceof THREE.LineLoop
            || objectToDispose instanceof THREE.Line
            || objectToDispose instanceof THREE.LineSegments
        ) {
            disposeMesh(objectToDispose);
        }
    }
}

export function disposeGroup(group) {
    if (group) {
        while (group.children.length > 0) {
            const meshToRemove = group.children[0];
            group.remove(meshToRemove);
            if (meshToRemove instanceof THREE.Mesh
                || meshToRemove instanceof THREE.LineLoop
                || meshToRemove instanceof THREE.Line
                || meshToRemove instanceof THREE.LineSegments
            ) {
                disposeMesh(meshToRemove);
            } else if (meshToRemove.children && meshToRemove.children.length > 0) {
                disposeGroup(meshToRemove);
            }
        }
    }
}

export function disposeMesh(mesh) {
    if (mesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => {
                material.dispose();
            });
        } else {
            mesh.material.dispose();
        }
    }
}