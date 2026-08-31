/*
  Photos picked from the camera/library land in a cache directory the OS is
  free to clear. Anything we intend to still have tomorrow — a project's
  "before", every recapture — gets copied somewhere durable first.
*/
import { File, Directory, Paths } from "expo-file-system";

const PHOTOS_DIR = "molehill-photos";

export async function copyToDurableStorage(cacheUri: string): Promise<string> {
  const photosDir = new Directory(Paths.document, PHOTOS_DIR);
  if (!photosDir.exists) {
    photosDir.create();
  }

  const ext = cacheUri.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const sourceFile = new File(cacheUri);
  const destFile = new File(photosDir, filename);

  await sourceFile.copy(destFile);

  return destFile.uri;
}

export function deleteStoredPhoto(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn("Failed to remove old progress photo:", error);
  }
}
