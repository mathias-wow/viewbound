# This script will create a backup of the viewbound_media volume and store it in the current directory as viewbound-backup.tar.gz

docker run --rm \
  -v viewbound_viewbound_media:/backup-volume \
  -v "$(pwd)":/backup \
  busybox \
  tar -zcvf /backup/viewbound-backup.tar.gz /backup-volume