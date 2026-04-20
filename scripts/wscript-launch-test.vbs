Dim shell
Dim projectDir
Dim command

Set shell = CreateObject("WScript.Shell")
projectDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
projectDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(projectDir)
shell.CurrentDirectory = projectDir

command = "cmd.exe /c ping -n 10 127.0.0.1 >nul & echo done > """ & projectDir & "\wscript-test.txt"""
shell.Run command, 0, False
